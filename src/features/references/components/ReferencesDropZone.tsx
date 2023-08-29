import { useMutation } from '@tanstack/react-query';
import { useAtomValue, useSetAtom } from 'jotai';
import { createRef, useState } from 'react';
import { VscFilePdf } from 'react-icons/vsc';

import { runPDFIngestion } from '../../../api/ingestion';
import { refreshFileTreeAtom } from '../../../atoms/fileExplorerActions';
import { projectIdAtom } from '../../../atoms/projectState';
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
  const projectId = useAtomValue(projectIdAtom);

  const inputRef = createRef<HTMLInputElement>();

  const ingestMutation = useMutation({
    mutationKey: [projectId],
    mutationFn: () => runPDFIngestion(projectId),
    onSuccess: (updatedReferences) => {
      setReferences(updatedReferences);
      setSyncInProgress(false);
      void refreshFileTree();
      notifyInfo('References upload completed');
    },
  });

  const uploadAndIngestMutation = useMutation({
    mutationFn: async (uploadedFiles: FileList) => {
      const files = Array.from(uploadedFiles).filter(validReferencesFiles);
      notifyInfo(
        'References upload started...',
        `Uploading ${files.length} files: \n\n` + files.map((f) => `- ${f.name}`).join('\n'),
      );
      await uploadFiles(files);
      ingestMutation.mutate();
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
          'absolute left-0 top-0 z-drop-zone h-screen w-screen opacity-90',
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
