import {
  createDir,
  exists,
  FileEntry as TauriFileEntry,
  readBinaryFile,
  readDir,
  readTextFile,
  removeDir as tauriRemoveDir,
  removeFile,
  renameFile as tauriRenameFile,
  writeBinaryFile,
  writeTextFile,
} from '@tauri-apps/api/fs';
import { appConfigDir, desktopDir, join, sep } from '@tauri-apps/api/path';
import { JSONContent } from '@tiptap/core';

import { EditorContent } from '../atoms/types/EditorContent';
import { FileEntry, FileFileEntry } from '../atoms/types/FileEntry';
import { notifyError } from '../notifications/notifications';
import { FILE2_CONTENT, FILE3_CONTENT, INITIAL_CONTENT } from './filesystem.sample-content';

const UPLOADS_DIR = 'uploads';

// #####################################################################################
// Top Level PATH API
// #####################################################################################

/**
 * System configurations directory for the Tauri app.
 *
 * Note that this path is "outside" of the project dir. Configurations are global.
 * Should only be used by the configuration.
 *
 * @returns An operating-system absolute path
 */
export async function getSystemConfigurationsDir() {
  return appConfigDir();
}

/**
 * Default dir for new projects.
 *
 * @returns An operating-system absolute path
 */
export async function getNewProjectsBaseDir() {
  return desktopDir();
}

let projectBaseDir = '';

/**
 * The project base directory configures the root folder for the project files.
 *
 * When opening
 */
export function getProjectBaseDir() {
  return projectBaseDir;
}
/**
 * Set the project base directory
 *
 * @param dir new project directory
 * @returns
 */
export function setProjectBaseDir(dir: string) {
  return (projectBaseDir = dir);
}

/**
 * Convert a ref-studio absolute path into operating-system absolute path
 *
 * (/folder/file.txt) -> (/usr/name/etc/tauri.foo/project-x/folder/file.txt)
 *
 * @param rsPath a ref-studio absolute path
 **/
export async function getSystemPath(rsPath: string) {
  return join(getProjectBaseDir(), rsPath);
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
  const baseDir = getProjectBaseDir();
  return absolutePath.replace(new RegExp(`^${baseDir}`), '');
}

/**
 * Returns the the OS-specific separator
 *
 * @returns the separator (/ or \)
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

export function makeUploadPath(filename: string) {
  return `${getUploadsDir()}${sep}${filename}`;
}

export function isInUploadsDir(relativePath: string) {
  return relativePath.startsWith(`${sep}${UPLOADS_DIR}`);
}

export async function uploadFiles(systemFiles: File[]) {
  for (const file of systemFiles) {
    const bytes = await file.arrayBuffer();
    const systemUploadFilePath = await getSystemPath(makeUploadPath(file.name));
    await writeBinaryFile(systemUploadFilePath, bytes);
  }
  return Array.from(systemFiles).map((file) => file.name);
}

// #####################################################################################
// Open Project Structure and read project files
// #####################################################################################
export async function newProject(projectPath: string) {
  try {
    setProjectBaseDir(projectPath);
    const systemBaseDir = await getSystemPath('');

    await createDir(systemBaseDir, { recursive: true });

    const systemUploadsDir = await getSystemPath(getUploadsDir());
    await createDir(systemUploadsDir, { recursive: true });

    console.log('New project create in folder ', systemBaseDir);
  } catch (err) {
    console.error('ERROR', err);
    throw new Error('Error creating new project in ' + projectPath);
  }
}

export async function openProject(projectPath: string) {
  try {
    setProjectBaseDir(projectPath);
    const systemBaseDir = await getSystemPath('');

    // Ensure uploads dir
    const systemUploadsDir = await getSystemPath(getUploadsDir());
    await createDir(systemUploadsDir, { recursive: true });

    console.log('Project opened for folder ', systemBaseDir);
  } catch (err) {
    console.error('ERROR', err);
    throw new Error('Error open project in ' + projectPath);
  }
}

export async function sampleProject(projectPath: string) {
  try {
    setProjectBaseDir(projectPath);
    const systemBaseDir = await getSystemPath('');

    if (await exists(systemBaseDir)) {
      await tauriRemoveDir(systemBaseDir, { recursive: true });
    }

    await createDir(systemBaseDir, { recursive: true });

    const systemUploadsDir = await getSystemPath(getUploadsDir());
    await createDir(systemUploadsDir, { recursive: true });

    await createSampleFiles(true);

    console.log('Project opened for folder ', systemBaseDir);
  } catch (err) {
    console.error('ERROR', err);
    throw new Error('Error open project in ' + projectPath);
  }
}

export async function createSampleFiles(overrideFiles = false) {
  try {
    await ensureFile('file 1.refstudio', INITIAL_CONTENT, overrideFiles);
    await ensureFile('file 2.refstudio', FILE2_CONTENT, overrideFiles);
    await ensureFile('file 3.refstudio', FILE3_CONTENT, overrideFiles);
  } catch (err) {
    console.error('ERROR', err);
    throw new Error('Error creating sample files');
  }
}

async function ensureFile(fileName: string, content: string, overrideFiles = false) {
  const absoluteFilePath = await getSystemPath(fileName);
  if (overrideFiles || !(await exists(absoluteFilePath))) {
    await writeTextFile(absoluteFilePath, content);
  }
}

export async function readAllProjectFiles() {
  const systemBaseDir = await getSystemPath('');
  console.log('reading file structure from ', systemBaseDir);
  const entries = await readDir(systemBaseDir, { recursive: true });
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
    const fileExtension = name.split('.').pop()?.toLowerCase() ?? '';
    return {
      name,
      path: refStudioPath,
      fileExtension,
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

// /some/absolute/path/file.txt -> /some/absolute/path
export function getParentFolder(filePath: string) {
  return filePath.split(sep).slice(0, -1).join(sep);
}

// #####################################################################################
// FILE Operations: read, write, delete, rename
// #####################################################################################
export async function writeFileContent(relativePath: string, textContent: string) {
  try {
    const systemPath = await getSystemPath(relativePath);
    await writeTextFile(systemPath, textContent);
    return true;
  } catch (err) {
    console.error('Error', err);
    return false;
  }
}

export async function readFileContent(file: FileFileEntry): Promise<EditorContent> {
  const systemPath = await getSystemPath(file.path);
  switch (file.fileExtension) {
    case 'xml': {
      const textContent = await readTextFile(systemPath);
      return { type: 'xml', textContent };
    }
    case 'json': {
      const textContent = await readTextFile(systemPath);
      return { type: 'json', textContent };
    }
    case 'pdf': {
      const binaryContent = await readBinaryFile(systemPath);
      return { type: 'pdf', binaryContent };
    }
    default: {
      const textContent = await readTextFile(systemPath);
      try {
        const jsonContent = JSON.parse(textContent) as JSONContent;
        return { type: 'refstudio', jsonContent };
      } catch (err) {
        notifyError('Invalid content. Cannot open file:', file.path);
        return { type: 'refstudio', jsonContent: [] };
      }
    }
  }
}

export async function deleteFile(relativePath: string): Promise<boolean> {
  const systemPath = await getSystemPath(relativePath);
  try {
    await removeFile(systemPath);
    return true;
  } catch (err) {
    console.error('Error', err);
    return false;
  }
}

export async function renameFile(relativePath: string, newName: string): RenameFileResult {
  const systemPath = await getSystemPath(relativePath);
  const newSystemPath = await join(getParentFolder(systemPath), newName);
  try {
    if (await exists(newSystemPath)) {
      console.warn(`Another file with the same name already exists: ${newSystemPath}`);
      return { success: false };
    }
    await tauriRenameFile(systemPath, newSystemPath);
    const newRelativePath = getRefStudioPath(newSystemPath);
    return { success: true, newPath: newRelativePath };
  } catch (err) {
    console.error('Error', err);
    return { success: false };
  }
}
type RenameFileResult = Promise<{ success: false } | { success: true; newPath: string }>;
