import { atom, Getter, PrimitiveAtom, Setter } from 'jotai';

import { FileEntry, FolderFileEntry } from '../types/FileEntry';
import {
  FileExplorerEntry,
  FileExplorerFileEntry,
  FileExplorerFolderEntry,
  RootFileExplorerEntry,
} from '../types/FileExplorerEntry';

export const fileExplorerEntriesAtom = atom<RootFileExplorerEntry>(createFileExplorerFolderEntry([], 'root', true));

function createFileExplorerFolderEntry(files: FileEntry[], folderName: 'root', root: true): RootFileExplorerEntry;
function createFileExplorerFolderEntry(files: FileEntry[], folderName: string): FileExplorerFolderEntry;
function createFileExplorerFolderEntry(
  files: FileEntry[],
  folderName: string,
  root?: boolean,
): FileExplorerFolderEntry {
  const filesAtom = atom<FileExplorerEntry[]>(files.filter((file) => !file.isDotfile).map(createFileExplorerEntry));
  const collapsedAtom = atom(true);
  return {
    isFolder: true,
    root,
    path: 'root',
    children: atom(
      (get) => get(filesAtom),
      (get, set, updatedFiles: FileEntry[]) => updateFolderChildren(get, set, updatedFiles, filesAtom),
    ),
    createFileAtom: atom(null, (get, set, file: FileExplorerFileEntry) => {
      const currentFiles = get(filesAtom);
      set(filesAtom, [...currentFiles, file]);
    }),
    collapsedAtom: atom(
      (get) => get(collapsedAtom),
      (get, set) => {
        set(collapsedAtom, !get(collapsedAtom));
      },
    ),
    name: folderName,
  };
}

function createFileExplorerEntry(file: FileEntry): FileExplorerEntry {
  if (file.isFile) {
    return {
      isFolder: false,
      name: file.name,
      path: file.path,
    };
  } else {
    return createFileExplorerFolderEntry(file.children, file.name);
  }
}

function updateFolderChildren(
  get: Getter,
  set: Setter,
  updatedFiles: FileEntry[],
  filesAtom: PrimitiveAtom<FileExplorerEntry[]>,
) {
  const currentFiles = get(filesAtom);
  const updatedFileFileEntries = updatedFiles.filter((f) => !f.isDotfile).filter((f) => !f.isFolder);

  // Update children files
  const updatedFileEntries = updatedFileFileEntries.map(createFileExplorerEntry);

  // Create a dict of children folders { [folderPath]: folder }
  const folders = Object.assign(
    {},
    ...updatedFiles
      .filter((f) => !f.isDotfile)
      .filter((f): f is FolderFileEntry => f.isFolder)
      .map((f) => ({ [f.path]: f })),
  ) as Record<string, FolderFileEntry>;

  const updatedFolderEntries = currentFiles
    .filter((f): f is FileExplorerFolderEntry => f.isFolder)
    .filter((f) => f.path in folders);

  // Recursively update children
  updatedFolderEntries.forEach((folderEntry) => {
    set(folderEntry.children, folders[folderEntry.path].children);
  });

  // Create entries for the new folders
  const currentFolderNames = new Set(currentFiles.filter((f) => f.isFolder).map((f) => f.path));
  const newFolderPaths = Object.keys(folders).filter((path) => !currentFolderNames.has(path));

  newFolderPaths.forEach((path) => {
    updatedFolderEntries.push(createFileExplorerFolderEntry(folders[path].children, folders[path].name));
  });

  set(filesAtom, [...updatedFolderEntries, ...updatedFileEntries]);
}
