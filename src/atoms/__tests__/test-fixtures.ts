import { buildEditorIdFromPath, EditorData } from '../types/EditorData';
import { FileEntry, FileFileEntry, FolderFileEntry } from '../types/FileEntry';

export function makeFileAndEditor(name: string, parentPath = ''): { fileEntry: FileFileEntry; editorData: EditorData } {
  const filePath = `${parentPath}/${name}`;
  const nameParts = name.split('.');
  return {
    fileEntry: {
      name,
      path: filePath,
      fileExtension: nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : '',
      isFolder: false,
      isDotfile: name.startsWith('.'),
      isFile: true,
    },
    editorData: {
      id: buildEditorIdFromPath(filePath),
      title: name,
    },
  };
}
export function makeFile(name: string, parentPath = ''): FileFileEntry {
  return makeFileAndEditor(name, parentPath).fileEntry;
}
export function makeFolder(name: string, children: FileEntry[] = [], parentPath = ''): FolderFileEntry {
  const path = `${parentPath}/${name}`;
  return {
    name,
    path,
    isFolder: true,
    isDotfile: false,
    isFile: false,
    children: children.map((child) => ({ ...child, path: path + child.path })),
  };
}
