import { WritableAtom } from 'jotai';

import { FileEntry } from './FileEntry';

interface FileExplorerEntryBase {
  name: string;
  path: string;
  // renameAtom
  // deleteAtom
}

export interface FileExplorerFileEntry extends FileExplorerEntryBase {
  isFolder: false;
}

export interface FileExplorerFolderEntry extends FileExplorerEntryBase {
  isFolder: true;
  childrenAtom: WritableAtom<FileExplorerEntry[], [files: FileEntry[]], void>;
  createFileAtom: WritableAtom<null, [file: FileExplorerFileEntry], void>;
  collapsedAtom: WritableAtom<boolean, [updatedValue: boolean], void>;
  root?: boolean;
}

export interface RootFileExplorerEntry extends FileExplorerFolderEntry {
  name: 'root';
  root: true;
}

export type FileExplorerEntry = FileExplorerFileEntry | FileExplorerFolderEntry;
