import { useMutation } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { createRef, useState } from 'react';
import { VscFilePdf } from 'react-icons/vsc';

import { runPDFIngestion } from '../../../api/ingestion';
import { refreshFileTreeAtom } from '../../../atoms/fileExplorerActions';
import { referencesSyncInProgressAtom, setReferencesAtom } from '../../../atoms/referencesState';
import { useListenEvent } from '../../../hooks/useListenEvent';
import { uploadFiles } from '../../../io/filesystem';
import { cx } from '../../../lib/cx';
import { notifyInfo } from '../../../notifications/notifications';
import { FilesDragDropZone } from '../../../wrappers/FilesDragDropZone';

function validReferencesFiles(file: File) {
  return file.name.toLowerCase().endsWith('.pdf');
}

export function ReferencesDropZone({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const setReferences = useSetAtom(setReferencesAtom);
  const refreshFileTree = useSetAtom(refreshFileTreeAtom);
  const setSyncInProgress = useSetAtom(referencesSyncInProgressAtom);

  const inputRef = createRef<HTMLInputElement>();

  const ingestMutation = useMutation({
    mutationFn: runPDFIngestion,
    onSuccess: (updatedReferences) => {
      setReferences(updatedReferences);
      setSyncInProgress(false);
      void refreshFileTree();
    },
  });

  const uploadAndIngestMutation = useMutation({
    mutationFn: async (uploadedFiles: FileList) => {
      const files = Array.from(uploadedFiles).filter(validReferencesFiles);
      notifyInfo(
        'References upload started...',
        `Uploading ${files.length} files: \n\n` + files.map((f) => `- ${f}`).join('\n'),
      );
      await uploadFiles(files);
      ingestMutation.mutate();
      notifyInfo('References upload completed');
    },
    onSuccess: () => setVisible(false),
  });

  useListenEvent('refstudio://menu/references/upload', () => inputRef.current?.click());

  const handleFilesUpload = (uploadedFiles: FileList) => {
    setSyncInProgress(true);
    uploadAndIngestMutation.mutate(uploadedFiles);
  };

  return (
    <FilesDragDropZone
      onFileDrop={handleFilesUpload}
      onFileDropCanceled={() => setVisible(false)}
      onFileDropStarted={() => setVisible(true)}
    >
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
          { hidden: !visible },
        )}
        data-testid="release-files-message"
      >
        <VscFilePdf className="" size={60} />
        Release to upload files to your library
      </div>
    </FilesDragDropZone>
  );
}
