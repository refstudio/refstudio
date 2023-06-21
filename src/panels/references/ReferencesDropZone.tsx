import { useMutation } from '@tanstack/react-query';
import { listen, TauriEvent, UnlistenFn } from '@tauri-apps/api/event';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { VscFilePdf } from 'react-icons/vsc';

import { runPDFIngestion } from '../../api/ingestion';
import { getReferencesAtom, referencesSyncInProgressAtom, setReferencesAtom } from '../../atoms/referencesState';
import { cx } from '../../cx';
import { copyFiles } from '../../filesystem';
import { isNonNullish } from '../../lib/isNonNullish';
import { ReferenceItem } from '../../types/ReferenceItem';

export function ReferencesDropZone() {
  const [visible, setVisible] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const references = useAtomValue(getReferencesAtom);
  const setReferences = useSetAtom(setReferencesAtom);
  const setSyncInProgress = useSetAtom(referencesSyncInProgressAtom);

  const copyFilesMutation = useMutation({
    mutationFn: copyFiles,
    onSuccess: (filePaths) => {
      // Merge new files
      // FIXME: Improve this once we have references state/status
      const newReferences = Array.from(filePaths)
        .map((filePath) => {
          const filename = filePath.split('/').pop();
          if (!filename) {
            return null;
          }
          const existingRef = references.find((ref) => ref.filename === filename);
          if (existingRef) {
            return null;
          }
          return {
            id: filename,
            citationKey: '...',
            title: filename,
            filename,
            authors: [{ fullName: 'Unknown' }],
          } as ReferenceItem;
        })
        .filter(isNonNullish);

      setReferences([...references, ...newReferences]);
    },
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

  const copyAndIngestMutation = useMutation({
    mutationFn: async (filePaths: string[]) => {
      await copyFilesMutation.mutateAsync(filePaths);
      await ingestMutation.mutateAsync();
    },
  });

  // FIXME: Replace with use async effect (after settings PR merge)
  useEffect(() => {
    let unlisten: UnlistenFn[] = [];
    let isMounted = true;
    (async function run() {
      unlisten = [
        await listen<string[]>(TauriEvent.WINDOW_FILE_DROP, (e) => {
          if (isMounted) {
            setSyncInProgress(true);
            copyAndIngestMutation.mutate(e.payload);
          }
        }),
        await listen('refstudio://references/ingestion/run', () => {
          if (isMounted) {
            setSyncInProgress(true);
            ingestMutation.mutate();
          }
        }),
        await listen<string[]>(TauriEvent.WINDOW_FILE_DROP_HOVER, (event) => {
          if (isMounted) {
            setVisible(true);
            setFiles(event.payload);
          }
        }),
        await listen(TauriEvent.WINDOW_FILE_DROP_CANCELLED, () => {
          if (isMounted) {
            setVisible(false);
            setFiles([]);
          }
        }),
      ];
    })();

    return () => {
      isMounted = false;
      unlisten.forEach((fn) => fn());
    };
  }, [copyAndIngestMutation, visible, files, setSyncInProgress]);

  return (
    <div
      className={cx(
        'absolute left-0 top-0 z-50 h-screen w-screen opacity-90',
        'flex flex-col items-center justify-center gap-4',
        'bg-slate-100 p-10 text-center text-xl',
        { hidden: !visible },
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
  );
}
