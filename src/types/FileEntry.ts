interface FileEntryBase {
  name: string;
  path: string;
}

interface FileFileEntry extends FileEntryBase {
  isFile: true;
  isFolder: false;
}

interface FolderFileEntry extends FileEntryBase {
  isFile: false;
  isFolder: true;
  children: FileEntry[];
}

export type FileEntry = FileFileEntry | FolderFileEntry;
