interface FileEntryBase {
  name: string;
  path: string;
  isDotfile: boolean;
}

export interface FileFileEntry extends FileEntryBase {
  isFile: true;
  isFolder: false;
  fileExtension: string;
}

export interface FolderFileEntry extends FileEntryBase {
  isFile: false;
  isFolder: true;
  children: FileEntry[];
}

export type FileEntry = FileFileEntry | FolderFileEntry;
