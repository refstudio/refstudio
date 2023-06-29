import { atom, useAtomValue, useSetAtom } from 'jotai';

import { createFileAtom } from '../atoms/fileEntryActions';
import { activeEditorAtom } from '../atoms/paneActions';
import { RefStudioEvents } from '../events';
import { useListenEvent } from '../hooks/useListenEvent';
import { asyncNoop } from '../lib/noop';

export function EventsListener({ children }: { children?: React.ReactNode }) {
  const saveActiveFile = useSaveActiveFile();
  const createFile = useCreateFile();

  useListenEvent(RefStudioEvents.menu.file.save, saveActiveFile);
  useListenEvent(RefStudioEvents.menu.file.new, createFile);

  return <>{children}</>;
}

function useSaveActiveFile() {
  const activeEditor = useAtomValue(activeEditorAtom);
  const saveFile = useSetAtom(activeEditor?.contentAtoms.saveEditorContentAtom ?? atom(null, asyncNoop));

  return () => void saveFile();
}

function useCreateFile() {
  const createFile = useSetAtom(createFileAtom);

  return () => void createFile();
}
