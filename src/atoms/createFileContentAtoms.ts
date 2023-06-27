import { atom } from 'jotai';
import { loadable } from 'jotai/utils';

import { writeFileContent } from '../filesystem';
import { FileContent } from './types/FileContent';
import { FileContentAtoms } from './types/FileContentAtoms';

export function createFileContentAtoms(
  filePath: string,
  initialContent: FileContent | Promise<FileContent>,
): FileContentAtoms {
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

  const saveFileAtom = atom(null, async (get) => {
    const fileContent = get(fileBufferAtom);
    if (fileContent) {
      switch (fileContent.type) {
        case 'tiptap': {
          await writeFileContent(filePath, fileContent.textContent);
          return;
        }
        default: {
          console.error('Save file - Unsupported file type: ', fileContent.type);
          return;
        }
      }
    }
  });

  return { loadableFileAtom, updateFileBufferAtom, saveFileInMemoryAtom, saveFileAtom };
}
