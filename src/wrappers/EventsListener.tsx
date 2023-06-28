import { atom, useAtomValue, useSetAtom } from 'jotai';

import { activePaneContentAtom } from '../atoms/fileActions';
import { RefStudioEvents } from '../events';
import { useListenEvent } from '../hooks/useListenEvent';
import { asyncNoop } from '../utils/noop';

export function EventsListener({ children }: { children?: React.ReactNode }) {
  const saveActiveFile = useSaveActiveFile();

  useListenEvent(RefStudioEvents.menu.file.save, saveActiveFile);

  return <>{children}</>;
}

function useSaveActiveFile() {
  const activePaneContent = useAtomValue(activePaneContentAtom);
  const saveFile = useSetAtom(activePaneContent.activeFileAtoms?.saveFileAtom ?? atom(null, asyncNoop));

  return () => void saveFile();
}
