import { useMutation } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { createRef, useState } from 'react';
import { VscFilePdf } from 'react-icons/vsc';

import { runPDFIngestion } from '../../api/ingestion';
import {
  referencesSyncInProgressAtom,
  setReferencesAtom,
  setTemporaryReferencesAtom,
} from '../../atoms/referencesState';
import { cx } from '../../cx';
import { listenEvent, RefStudioEvents } from '../../events';
import { uploadFiles } from '../../filesystem';
import { useAsyncEffect } from '../../hooks/useAsyncEffect';
import { FilesDragDropZone } from './FilesDragDropZone';

function validReferencesFiles(file: File) {
  return file.name.toLowerCase().endsWith('.pdf');
}

export function ReferencesDropZone({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const setReferences = useSetAtom(setReferencesAtom);
  const setTemporaryReferences = useSetAtom(setTemporaryReferencesAtom);
  const setSyncInProgress = useSetAtom(referencesSyncInProgressAtom);

  const inputRef = createRef<HTMLInputElement>();

  const uploadFilesMutation = useMutation({
    mutationFn: uploadFiles,
    onSuccess: (filePaths) => setTemporaryReferences(filePaths),
    onSettled: () => {
      setVisible(false);
      setFiles([]);
    },
  });

  const ingestMutation = useMutation({
    mutationFn: runPDFIngestion,
    onSuccess: (updatedReferences) => {
      setReferences(updatedReferences);
      setSyncInProgress(false);
    },
  });

  const uploadAndIngestMutation = useMutation({
    mutationFn: async (uploadedFiles: FileList) => {
      await uploadFilesMutation.mutateAsync(Array.from(uploadedFiles).filter(validReferencesFiles));
      await ingestMutation.mutateAsync();
    },
  });

  useAsyncEffect(
    async (isMounted) =>
      Promise.all([
        await listenEvent<FileList>(RefStudioEvents.references.ingestion.run, (event) => {
          if (isMounted()) {
            setSyncInProgress(true);
            uploadAndIngestMutation.mutate(event.payload);
          }
        }),
        await listenEvent(RefStudioEvents.references.ingestion.upload, () => {
          if (isMounted()) {
            inputRef.current?.click();
          }
        }),
      ]),
    (releaseHandles) => releaseHandles?.map((h) => h()),
  );

  const handleFilesUpload = (uploadedFiles: FileList) => {
    setSyncInProgress(true);
    uploadAndIngestMutation.mutate(uploadedFiles);
  };

  return (
    <FilesDragDropZone onFileDrop={handleFilesUpload}>
      {children}
      <input
        accept="application/pdf"
        className="hidden"
        multiple
        ref={inputRef}
        role="form"
        type="file"
        onChange={(e) => e.currentTarget.files && handleFilesUpload(e.currentTarget.files)}
      />
      <div
        className={cx(
          'absolute left-0 top-0 z-50 h-screen w-screen opacity-90',
          'flex flex-col items-center justify-center gap-4',
          'bg-slate-100 p-10 text-center text-xl',
          { hidden: !visible || files.length === 0 },
        )}
      >
        <VscFilePdf className="" size={60} />
        Release to upload files to your library
        {import.meta.env.DEV && (
          <pre className="text-left text-xs">
            <ul className="list-disc">
              {files.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </pre>
        )}
      </div>
    </FilesDragDropZone>
  );
}
