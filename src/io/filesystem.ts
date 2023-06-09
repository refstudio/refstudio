import {
  createDir,
  exists,
  FileEntry as TauriFileEntry,
  readBinaryFile,
  readDir,
  readTextFile,
  removeFile,
  renameFile as tauriRenameFile,
  writeBinaryFile,
  writeTextFile,
} from '@tauri-apps/api/fs';
import { appConfigDir, appDataDir, join, sep } from '@tauri-apps/api/path';

import { EditorContent } from '../atoms/types/EditorContent';
import { FileEntry, FileFileEntry } from '../atoms/types/FileEntry';
import { FILE2_CONTENT, FILE3_CONTENT, INITIAL_CONTENT } from './filesystem.sample-content';

const PROJECT_NAME = 'project-x';
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
 * System application data directory for the Tauri app.
 *
 * Note that this path is were the PROJECT_NAME directory should exist.
 * Should only be used by the configuration and sidecar.
 *
 * @returns An operating-system absolute path
 */
export async function getSystemAppDataDir() {
  return appDataDir();
}

/**
 * This is the refstudio project base dir.
 *
 * NOTE: For now the PROJECT_NAME is hard-coded
 **/
async function getProjectBaseDir() {
  return join(await appDataDir(), PROJECT_NAME);
}

/**
 * Convert a ref-studio absolute path into operating-system absolute path
 *
 * (/folder/file.txt) -> (/usr/name/etc/tauri.foo/project-x/folder/file.txt)
 *
 * @param rsPath a ref-studio absolute path
 **/
export async function getSystemPath(rsPath: string) {
  return join(await getProjectBaseDir(), rsPath);
}

/**
 * Convert an operating-system absolute path into a ref-studio absolute path.
 *
 * (/usr/name/etc/tauri.foo/project-x/folder/file.txt) -> (/folder/file.txt)
 *
 * @param absolutePath an operating-system absolute path
 * @returns
 */
export async function getRefStudioPath(absolutePath: string) {
  const baseDir = await getProjectBaseDir();
  return absolutePath.replace(new RegExp(`^${baseDir}`), '');
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
// Project Structure and read project files
// #####################################################################################
export async function ensureProjectFileStructure() {
  try {
    const systemBaseDir = await getSystemPath('');
    await createDir(systemBaseDir, { recursive: true });

    const systemUploadsDir = await getSystemPath(getUploadsDir());
    await createDir(systemUploadsDir, { recursive: true });

    await ensureFile('file 1.refstudio', INITIAL_CONTENT);
    await ensureFile('file 2.refstudio', FILE2_CONTENT);
    await ensureFile('file 3.refstudio', FILE3_CONTENT);

    console.log('Project structure created with success. Folder: ', systemBaseDir);
  } catch (err) {
    console.error('ERROR', err);
    throw new Error('Error ensuring file struture');
  }
}

async function ensureFile(fileName: string, content: string) {
  const absoluteFilePath = await getSystemPath(fileName);
  if (!(await exists(absoluteFilePath))) {
    await writeTextFile(absoluteFilePath, content);
  }
}

export async function readAllProjectFiles() {
  const systemBaseDir = await getSystemPath('');
  const entries = await readDir(systemBaseDir, { recursive: true });
  return Promise.all(entries.map(convertTauriFileEntryToFileEntry));
}

async function convertTauriFileEntryToFileEntry(entry: TauriFileEntry): Promise<FileEntry> {
  const isFolder = !!entry.children;
  const name = entry.name ?? '';
  const isDotfile = name.startsWith('.');
  const refStudioPath = await getRefStudioPath(entry.path);

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
      return { type: 'text', textContent };
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
    const newRelativePath = await getRefStudioPath(newSystemPath);
    return { success: true, newPath: newRelativePath };
  } catch (err) {
    console.error('Error', err);
    return { success: false };
  }
}
type RenameFileResult = Promise<{ success: false } | { success: true; newPath: string }>;
