import { splitFilePath } from '../../io/filesystem';

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

export function getFileFileEntryFromPath(filePath: string): FileFileEntry {
  const name = splitFilePath(filePath).pop() ?? '';
  return {
    path: filePath,
    name,
    fileExtension: name.split('.').pop() ?? '',
    isDotfile: name.startsWith('.'),
    isFile: true,
    isFolder: false,
  };
}
