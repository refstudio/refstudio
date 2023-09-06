import type { FileEntry as TauriFileEntry } from '@tauri-apps/api/fs';
import { JSONContent } from '@tiptap/core';

import {
  deleteProjectFile,
  readProjectBinaryFile,
  readProjectFiles,
  readProjectTextFile,
  renameProjectFile,
  writeProjectBinaryFile,
  writeProjectTextFile,
} from '../api/projectsAPI';
import { EditorContent } from '../atoms/types/EditorContent';
import { FileEntry, FileFileEntry } from '../atoms/types/FileEntry';
import { serializeReferences } from '../features/textEditor/components/tipTapNodes/refStudioDocument/serialization/serializeReferences';
import { notifyError, notifyInfo } from '../notifications/notifications';
import { ReferenceItem } from '../types/ReferenceItem';
import { desktopDir, sep } from '../wrappers/tauri-wrapper';
import { FILE2_CONTENT, FILE3_CONTENT, INITIAL_CONTENT } from './filesystem.sample-content';

const UPLOADS_DIR = 'uploads';
const EXPORTS_DIR = 'exports';

// #####################################################################################
// Top Level PATH API
// #####################################################################################

/**
 * Default dir for new projects.
 *
 * @returns An operating-system absolute path
 */
export async function getNewProjectsBaseDir() {
  return desktopDir();
}

/**
 * Returns the the OS-specific separator
 *
 * @returns the separator (/ or \\)
 */
export function getSeparator() {
  return sep;
}

// #####################################################################################
// UPLOADS
// #####################################################################################
export function getUploadsDir() {
  return UPLOADS_DIR;
}

export function makeUploadPath(filename: string) {
  return `${getUploadsDir()}${sep}${filename}`;
}

export function isInUploadsDir(relativeFilePath: string) {
  return relativeFilePath.startsWith(`${UPLOADS_DIR}${sep}`);
}

export async function uploadFiles(systemFiles: File[]) {
  for (const file of systemFiles) {
    const relativePath = makeUploadPath(file.name);
    const bytes = await file.arrayBuffer();
    await writeProjectBinaryFile(currentProjectId, relativePath, bytes);
  }
  return Array.from(systemFiles).map((file) => file.name);
}

// #####################################################################################
// EXPORTS
// #####################################################################################
export function getExportsDir() {
  return EXPORTS_DIR;
}

export function makeExportsPath(filename: string) {
  return `${getExportsDir()}${sep}${filename}`;
}

// #####################################################################################
// FileSystem project ID
//  - This is needed to make calls to the backend API for a specific project
// #####################################################################################
let currentProjectId = '';
export function setCurrentFileSystemProjectId(projectId: string) {
  currentProjectId = projectId;
}

// #####################################################################################
// Open Project Structure and read project files
// #####################################################################################
export async function ensureSampleProjectFiles(projectId: string) {
  try {
    await writeProjectTextFile(projectId, 'file 1.refstudio', INITIAL_CONTENT);
    await writeProjectTextFile(projectId, 'file 2.refstudio', FILE2_CONTENT);
    await writeProjectTextFile(projectId, 'file 3.refstudio', FILE3_CONTENT);
    console.log('Sample project opened with success');
  } catch (err) {
    console.error('ERROR', err);
    throw new Error('Error open sample project');
  }
}

export async function readAllProjectFiles() {
  if (!currentProjectId) {
    return [];
  }

  console.log('reading file structure from web');
  const entries = await readProjectFiles(currentProjectId);
  return Promise.all(entries.map(convertTauriFileEntryToFileEntry));
}

async function convertTauriFileEntryToFileEntry(entry: TauriFileEntry): Promise<FileEntry> {
  const isFolder = !!entry.children;
  const name = entry.name ?? '';
  const isDotfile = name.startsWith('.');
  const refStudioPath = entry.path;

  if (isFolder) {
    return {
      name,
      path: refStudioPath,
      isFolder,
      isFile: !isFolder,
      isDotfile,
      children: await Promise.all(entry.children!.map(convertTauriFileEntryToFileEntry)),
    };
  } else {
    const nameParts = name.split('.');
    return {
      name,
      path: refStudioPath,
      fileExtension: nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : '',
      isFolder,
      isDotfile,
      isFile: !isFolder,
    };
  }
}

// #####################################################################################
// file path utils
// #####################################################################################

// some/refstudio/absolute/path/file.txt -> ["some", "refstudio", "absolute", "path", "file.txt"]
export function splitRefStudioPath(filePath: string): string[] {
  return filePath.split(sep);
}

export function getFileNameAndExtension(filePath: string): { name: string; ext: string } {
  const fileName = filePath.slice(filePath.lastIndexOf(sep) + 1);
  if (fileName.startsWith('.')) {
    return { name: fileName, ext: '' };
  }

  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex === -1) {
    return { name: fileName, ext: '' };
  }
  return { name: fileName.slice(0, dotIndex), ext: fileName.slice(dotIndex + 1) };
}

// #####################################################################################
// FILE Operations: read, write, delete, rename
// #####################################################################################
export async function writeFileContent(relativePath: string, textContent: string) {
  try {
    await writeProjectTextFile(currentProjectId, relativePath, textContent);
    return true;
  } catch (err) {
    console.error('Error', err);
    return false;
  }
}

export async function readFileContent(file: FileFileEntry): Promise<EditorContent> {
  switch (file.fileExtension) {
    case 'json': {
      const textContent = await readProjectTextFile(currentProjectId, file.path);
      return { type: 'json', textContent };
    }
    case 'pdf': {
      const binaryContent = await readProjectBinaryFile(currentProjectId, file.path);
      return { type: 'pdf', binaryContent };
    }
    case 'refstudio':
    case '': {
      const textContent = await readProjectTextFile(currentProjectId, file.path);
      try {
        const jsonContent = JSON.parse(textContent) as JSONContent;
        return { type: 'refstudio', jsonContent };
      } catch (err) {
        notifyError('Invalid content. Cannot open file:', file.path);
        return { type: 'refstudio', jsonContent: [] };
      }
    }
    default: {
      const textContent = await readProjectTextFile(currentProjectId, file.path);
      return { type: 'text', textContent };
    }
  }
}

export async function deleteFile(relativePath: string): Promise<boolean> {
  try {
    await deleteProjectFile(currentProjectId, relativePath);
    return true;
  } catch (err) {
    console.error('Error', err);
    return false;
  }
}

export async function renameFile(relativePath: string, newRelativePath: string): RenameFileResult {
  if (relativePath.split(getSeparator()).length > 1) {
    console.warn(`Only root files can be renamed. Found ${relativePath}`);
    return { success: false };
  }
  try {
    await renameProjectFile(currentProjectId, relativePath, newRelativePath);
    return { success: true, newPath: newRelativePath };
  } catch (err) {
    console.error('Error', err);
    return { success: false };
  }
}
type RenameFileResult = Promise<{ success: false } | { success: true; newPath: string }>;

// #####################################################################################
// Export Operations: references
// #####################################################################################
export async function exportReferences(references: ReferenceItem[]) {
  try {
    const serializedReferences = serializeReferences(references);
    const exportPath = makeExportsPath(`references.${serializedReferences.extension}`);
    await writeFileContent(exportPath, serializedReferences.textContent);
    notifyInfo('References exported', `Exported ${references.length} references to ${exportPath}`);
    return exportPath;
  } catch (err) {
    console.error('Error', err);
  }
}
