import { atom } from 'jotai';
import { Mock } from 'vitest';

import { buildEditorId, EditorData } from '../types/EditorData';
import { FileEntry, FileFileEntry, FolderFileEntry } from '../types/FileEntry';
import { FileExplorerEntry, FileExplorerFileEntry, FileExplorerFolderEntry } from '../types/FileExplorerEntry';

export function makeFile(name: string): { fileEntry: FileFileEntry; editorData: EditorData } {
  const filePath = './' + name;
  return {
    fileEntry: {
      name,
      path: filePath,
      fileExtension: name.split('.').pop() ?? '',
      isFolder: false,
      isDotfile: name.startsWith('.'),
      isFile: true,
    },
    editorData: {
      id: buildEditorId('text', filePath),
      title: name,
    },
  };
}
export function makeFolder(name: string, children: FileEntry[] = []): FolderFileEntry {
  return {
    name,
    path: './' + name,
    isFolder: true,
    isDotfile: false,
    isFile: false,
    children,
  };
}
export function makeFileExplorerFileEntry(name: string): FileExplorerFileEntry {
  const filePath = './' + name;
  return {
    isFolder: false,
    name,
    path: filePath,
  };
}
export function makeFileExplorerFolderEntry(
  name: string,
  children: FileExplorerEntry[],
  root: boolean,
): {
  createFileMock: Mock<[file: FileExplorerFileEntry], void>;
  updateChildrenMock: Mock<[files: FileEntry[]], void>;
  folderEntry: FileExplorerFolderEntry;
} {
  const folderPath = './' + name;
  const createFileMock = vi.fn();
  const updateChildrenMock = vi.fn();

  const collapsedAtom = atom(true);
  return {
    createFileMock,
    updateChildrenMock,
    folderEntry: {
      isFolder: true,
      root,
      name,
      path: folderPath,
      createFileAtom: atom(null, createFileMock),
      childrenAtom: atom(children, updateChildrenMock),
      collapsedAtom: atom(
        (get) => get(collapsedAtom),
        (get, set) => set(collapsedAtom, !get(collapsedAtom)),
      ),
    } as const,
  };
}
