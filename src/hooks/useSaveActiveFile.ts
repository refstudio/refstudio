import { atom, useAtomValue, useSetAtom } from 'jotai';

import { activePaneContentAtom } from '../atoms/fileActions';
import { asyncNoop } from '../utils/noop';

export function useSaveActiveFile(): () => void {
  const activePaneContent = useAtomValue(activePaneContentAtom);
  const saveFile = useSetAtom(activePaneContent.activeFileAtoms?.saveFileAtom ?? atom(null, asyncNoop));

  return () => void saveFile();
}
