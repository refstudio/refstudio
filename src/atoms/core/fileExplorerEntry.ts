import { atom } from 'jotai';

import { buildEditorId } from '../types/EditorData';
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
    children: atom(
      (get) => get(filesAtom),
      (get, set, updatedFiles: FileEntry[]) => {
        const currentFiles = get(filesAtom);
        const updatedFileFileEntries = updatedFiles.filter((f) => !f.isDotfile).filter((f) => !f.isFolder);
        const temporaryFiles = currentFiles.filter((f) => f.isTemporary);

        // Update file children and keep temporary files
        const updatedFileEntries = [...updatedFileFileEntries.map(createFileExplorerEntry), ...temporaryFiles];

        // Create a dict { [folderName]: folder }
        const folders = Object.assign(
          {},
          ...updatedFiles
            .filter((f) => !f.isDotfile)
            .filter((f): f is FolderFileEntry => f.isFolder)
            .map((f) => ({ [f.name]: f })),
        ) as Record<string, FolderFileEntry>;

        const updatedFolderEntries = currentFiles
          .filter((f): f is FileExplorerFolderEntry => f.isFolder)
          .filter((f) => f.name in folders);

        // Recursively update children
        updatedFolderEntries.forEach((folderEntry) => {
          set(folderEntry.children, folders[folderEntry.name].children);
        });

        const currentFolderNames = new Set(currentFiles.filter((f) => f.isFolder).map((f) => f.name));
        const newFolderNames = Object.keys(folders).filter((name) => !currentFolderNames.has(name));

        newFolderNames.forEach((name) => {
          updatedFolderEntries.push(createFileExplorerFolderEntry(folders[name].children, folders[name].name));
        });

        set(filesAtom, [...updatedFolderEntries, ...updatedFileEntries]);
      },
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
      editorId: buildEditorId('text', file.path),
    };
  } else {
    return createFileExplorerFolderEntry(file.children, file.name);
  }
}
