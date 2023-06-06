interface FileEntryBase {
  name: string;
  path: string;
  isDotfile: boolean;
}

interface FileFileEntry extends FileEntryBase {
  isFile: true;
  isFolder: false;
  fileExtension: string;
}

interface FolderFileEntry extends FileEntryBase {
  isFile: false;
  isFolder: true;
  children: FileEntry[];
}

export type FileEntry = FileFileEntry | FolderFileEntry;
