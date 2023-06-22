import { FileData } from './types/FileData';
import { FileEntry, FileFileEntry, FolderFileEntry } from './types/FileEntry';

export function makeFile(name: string): { fileEntry: FileFileEntry; fileData: FileData } {
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
    fileData: {
      fileId: filePath,
      fileName: name,
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
