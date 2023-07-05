import { atom, Getter, Setter, WritableAtom } from 'jotai';

import { FileEntry, FolderFileEntry } from '../types/FileEntry';
import { FileExplorerEntry, FileExplorerFolderEntry, RootFileExplorerEntry } from '../types/FileExplorerEntry';

export const fileExplorerEntriesAtom = atom<RootFileExplorerEntry>(createFileExplorerFolderEntry([], 'root', '', true));

/** Recursively creates a file explorer entry and its atoms from an array of file entries */
function createFileExplorerFolderEntry(
  files: FileEntry[],
  folderName: 'root',
  entryPath: '',
  root: true,
): RootFileExplorerEntry;
function createFileExplorerFolderEntry(
  files: FileEntry[],
  folderName: string,
  entryPath: string,
): FileExplorerFolderEntry;
function createFileExplorerFolderEntry(
  files: FileEntry[],
  folderName: string,
  entryPath: string,
  root?: boolean,
): FileExplorerFolderEntry {
  const filesAtom = createFilesAtom(files.filter((file) => !file.isDotfile).map(createFileExplorerEntry));
  return {
    isFolder: true,
    root,
    path: entryPath,
    childrenAtom: atom((get) => get(filesAtom), updateFolderChildren(filesAtom)),
    collapsedAtom: atom(true),
    name: folderName,
  };
}

/**
 * Creates the atom containing file explorer entry.
 * The atom is responsible for keeping the entries sorted
 */
function createFilesAtom(files: FileExplorerEntry[]) {
  const filesAtom = atom<FileExplorerEntry[], [FileExplorerEntry[]], undefined>(
    files.sort(compareFileExplorerEntries),
    (_get, set, fileExplorerEntries: FileExplorerEntry[]) => {
      set(filesAtom, fileExplorerEntries.sort(compareFileExplorerEntries));
    },
  );
  return filesAtom;
}

/** Creates a file explorer entry depending on the type of the given file entry (file or folder) */
function createFileExplorerEntry(file: FileEntry): FileExplorerEntry {
  if (file.isFile) {
    return {
      isFolder: false,
      name: file.name,
      path: file.path,
    };
  } else {
    return createFileExplorerFolderEntry(file.children, file.name, file.path);
  }
}

/**
 * Update function for a folder explorer entry children atom
 *
 * This filters out dotfiles, updates the files and recursively updates the children entries for a folder
 * */
function updateFolderChildren(filesAtom: WritableAtom<FileExplorerEntry[], [FileExplorerEntry[]], undefined>) {
  return (get: Getter, set: Setter, updatedFiles: FileEntry[]) => {
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
      set(folderEntry.childrenAtom, folders[folderEntry.path].children);
    });

    // Create entries for the new folders
    const currentFolderNames = new Set(currentFiles.filter((f) => f.isFolder).map((f) => f.path));
    const newFolderPaths = Object.keys(folders).filter((path) => !currentFolderNames.has(path));

    newFolderPaths.forEach((path) => {
      updatedFolderEntries.push(createFileExplorerFolderEntry(folders[path].children, folders[path].name, path));
    });

    set(filesAtom, [...updatedFolderEntries, ...updatedFileEntries]);
  };
}

/**
 * Compare function to sort file explorer entries.
 *
 * A folder always comes before a file
 * Entries of the same type are alphabetically sorted
 * */
function compareFileExplorerEntries(
  fileExplorerEntryA: FileExplorerEntry,
  fileExplorerEntryB: FileExplorerEntry,
): -1 | 0 | 1 {
  if (fileExplorerEntryA.isFolder && !fileExplorerEntryB.isFolder) {
    return -1;
  }

  if (!fileExplorerEntryA.isFolder && fileExplorerEntryB.isFolder) {
    return 1;
  }

  const fileExplorerEntryNameA = fileExplorerEntryA.name.toLowerCase();
  const fileExplorerEntryNameB = fileExplorerEntryB.name.toLowerCase();

  return fileExplorerEntryNameA < fileExplorerEntryNameB ? -1 : fileExplorerEntryNameA > fileExplorerEntryNameB ? 1 : 0;
}
