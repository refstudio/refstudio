import { save } from '@tauri-apps/api/dialog';
import type { FileEntry as TauriFileEntry } from '@tauri-apps/api/fs';
import { JSONContent } from '@tiptap/core';

import {
  deleteProjectFile,
  existsProjectFile,
  readProjectBinaryFile,
  readProjectFiles,
  readProjectTextFile,
  renameProjectFile,
  writeProjectBinaryFile,
  writeProjectTextFile,
} from '../api/projectsAPI';
import { EditorContent } from '../atoms/types/EditorContent';
import { FileEntry, FileFileEntry } from '../atoms/types/FileEntry';
import { MarkdownSerializer } from '../features/textEditor/components/tipTapNodes/refStudioDocument/serialization/MarkdownSerializer';
import { serializeReferences } from '../features/textEditor/components/tipTapNodes/refStudioDocument/serialization/serializeReferences';
import { notifyError } from '../notifications/notifications';
import { ReferenceItem } from '../types/ReferenceItem';
import { desktopDir, join, sep } from '../wrappers/tauri-wrapper';
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
 * Convert an operating-system absolute path into a ref-studio absolute path.
 *
 * (/usr/name/etc/tauri.foo/project-x/folder/file.txt) -> (/folder/file.txt)
 *
 * @param absolutePath an operating-system absolute path
 * @returns
 */
export function getRefStudioPath(absolutePath: string) {
  const baseDir = '';
  return absolutePath.replace(new RegExp(`^${baseDir}`), '');
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
  return makeRefStudioPath(UPLOADS_DIR);
}

export function getExportsDir() {
  return makeRefStudioPath(EXPORTS_DIR);
}

export function makeUploadPath(filename: string) {
  return `${getUploadsDir()}${sep}${filename}`;
}

export function isInUploadsDir(relativePath: string) {
  return relativePath.startsWith(`${sep}${UPLOADS_DIR}`);
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
  console.log('reading file structure from web');
  const entries = await readProjectFiles(currentProjectId);
  return Promise.all(entries.map(convertTauriFileEntryToFileEntry));
}

async function convertTauriFileEntryToFileEntry(entry: TauriFileEntry): Promise<FileEntry> {
  const isFolder = !!entry.children;
  const name = entry.name ?? '';
  const isDotfile = name.startsWith('.');
  const refStudioPath = getRefStudioPath(entry.path);

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
// file.txt -> /file.txt
export function makeRefStudioPath(fileName: string) {
  return `${sep}${fileName}`;
}

// /some/absolute/path/file.txt -> ["", "some", "absolute", "path", "file.txt"]
export function splitRefStudioPath(filePath: string): string[] {
  return filePath.split(sep);
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
    if (await existsProjectFile(currentProjectId, newRelativePath)) {
      console.warn(`Another file with the same name already exists: ${newRelativePath}`);
      return { success: false };
    }
    await renameProjectFile(currentProjectId, relativePath, newRelativePath);
    return { success: true, newPath: newRelativePath };
  } catch (err) {
    console.error('Error', err);
    return { success: false };
  }
}
type RenameFileResult = Promise<{ success: false } | { success: true; newPath: string }>;

// #####################################################################################
// Export Operations: references, markdown
// #####################################################################################
export async function exportReferences(references: ReferenceItem[]) {
  try {
    const exportsDir = getExportsDir();

    const serializedReferences = serializeReferences(references);

    const defaultPath = await join(exportsDir, `references.${serializedReferences.extension}`);

    const filePath = await save({
      title: 'Export References',
      defaultPath,
      filters: [{ name: serializedReferences.extension, extensions: [serializedReferences.extension] }],
    });
    if (filePath) {
      return writeProjectTextFile(currentProjectId, filePath, serializedReferences.textContent);
    }
  } catch (err) {
    console.error('Error', err);
  }
}

export async function saveAsMarkdown(markdownSerializer: MarkdownSerializer, exportedFilePath: string) {
  try {
    const exportsDir = getExportsDir();

    const splittedPath = exportedFilePath.split(sep);
    const fileName = splittedPath.pop();
    if (!fileName) {
      return;
    }
    let markdownFileName: string;
    if (fileName.includes('.')) {
      const splittedFileName = fileName.split('.');
      splittedFileName.pop();
      markdownFileName = `${splittedFileName.join('.')}.md`;
    } else {
      markdownFileName = `${fileName}.md`;
    }

    const markdownFilePath = [exportsDir, markdownFileName].join(sep);
    const filePath = markdownFilePath;

    // const filePath = await save({
    //   title: 'Export file as Markdown',
    //   defaultPath: await getSystemPath(markdownFilePath),
    //   filters: [{ name: 'Markdown', extensions: ['md'] }],
    // });

    if (filePath) {
      const filePathParts = filePath.split(sep);
      const newFileName = filePathParts.pop();
      if (newFileName) {
        const newFileNameParts = newFileName.split('.');
        const newFileNameWithoutExtension =
          newFileNameParts.length > 1 ? newFileNameParts.slice(0, -1).join('.') : newFileName;

        const serializedContent = markdownSerializer.serialize(newFileNameWithoutExtension);

        if (!serializedContent.bibliography) {
          return writeProjectTextFile(currentProjectId, filePath, serializedContent.markdownContent);
        }

        const bibliographyFilePath = [
          ...filePathParts,
          `${newFileNameWithoutExtension}.${serializedContent.bibliography.extension}`,
        ].join(sep);

        return Promise.all([
          writeProjectTextFile(currentProjectId, filePath, serializedContent.markdownContent),
          writeProjectTextFile(currentProjectId, bibliographyFilePath, serializedContent.bibliography.textContent),
        ]);
      }
    }
  } catch (err) {
    console.error('Error', err);
  }
}
