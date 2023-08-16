import { atom } from 'jotai';
import { Mock } from 'vitest';

import { buildEditorIdFromPath, EditorData } from '../types/EditorData';
import { FileEntry, FileFileEntry, FolderFileEntry } from '../types/FileEntry';
import { FileExplorerEntry, FileExplorerFileEntry, FileExplorerFolderEntry } from '../types/FileExplorerEntry';

export function makeFileAndEditor(name: string, parentPath = ''): { fileEntry: FileFileEntry; editorData: EditorData } {
  const filePath = `${parentPath}/${name}`;
  const nameParts = name.split('.');
  return {
    fileEntry: {
      name,
      path: filePath,
      fileExtension: nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : '',
      isFolder: false,
      isDotfile: name.startsWith('.'),
      isFile: true,
    },
    editorData: {
      id: buildEditorIdFromPath(filePath),
      title: name,
    },
  };
}
export function makeFile(name: string, parentPath = ''): FileFileEntry {
  return makeFileAndEditor(name, parentPath).fileEntry;
}
export function makeFolder(name: string, children: FileEntry[] = [], parentPath = ''): FolderFileEntry {
  const path = `${parentPath}/${name}`;
  return {
    name,
    path,
    isFolder: true,
    isDotfile: false,
    isFile: false,
    children: children.map((child) => ({ ...child, path: path + child.path })),
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

  return {
    createFileMock,
    updateChildrenMock,
    folderEntry: {
      isFolder: true,
      root,
      name,
      path: folderPath,
      childrenAtom: atom(children, updateChildrenMock),
      collapsedAtom: atom(true),
    } as const,
  };
}
