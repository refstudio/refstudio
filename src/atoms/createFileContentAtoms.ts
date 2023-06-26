import { atom } from 'jotai';
import { loadable } from 'jotai/utils';

import { FileContent } from './types/FileContent';
import { FileContentAtoms } from './types/FileContentAtoms';

export function createFileContentAtoms(initialContent: FileContent | Promise<FileContent>): FileContentAtoms {
  const fileAtom = atom(initialContent);
  const fileBufferAtom = atom<FileContent | null>(null);

  const loadableFileAtom = loadable(fileAtom);

  const updateFileBufferAtom = atom(null, (_, set, payload: FileContent) => {
    set(fileBufferAtom, payload);
  });

  const saveFileInMemoryAtom = atom(null, (get, set) => {
    const fileContent = get(fileBufferAtom);
    if (fileContent) {
      set(fileAtom, fileContent);
    }
  });

  return { loadableFileAtom, updateFileBufferAtom, saveFileInMemoryAtom };
}
