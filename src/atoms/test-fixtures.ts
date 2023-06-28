import { buildEditorId, EditorData } from './types/EditorData';
import { FileEntry, FileFileEntry, FolderFileEntry } from './types/FileEntry';

export function makeFile(name: string): { fileEntry: FileFileEntry; editorData: EditorData } {
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
    editorData: {
      id: buildEditorId('text', filePath),
      title: name,
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
