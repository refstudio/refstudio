import { save } from '@tauri-apps/api/dialog';
import type { FileEntry as TauriFileEntry } from '@tauri-apps/api/fs';
import { JSONContent } from '@tiptap/core';

import { EditorContent } from '../atoms/types/EditorContent';
import { FileEntry, FileFileEntry } from '../atoms/types/FileEntry';
import { MarkdownSerializer } from '../features/textEditor/components/tipTapNodes/refStudioDocument/serialization/MarkdownSerializer';
import { serializeReferences } from '../features/textEditor/components/tipTapNodes/refStudioDocument/serialization/serializeReferences';
import { notifyError } from '../notifications/notifications';
import { ReferenceItem } from '../types/ReferenceItem';
import {
  deleteFileFromWeb,
  isRunningOnWeb,
  readBinaryFileFromWeb,
  readProjectFilesFromWeb,
  readTextFileFromWeb,
  renameFileFromWeb,
  writeBinaryFileFromWeb,
  writeTextFileFromWeb,
} from '../web';
import {
  appConfigDir,
  createDir,
  desktopDir,
  exists,
  join,
  readBinaryFile,
  readDir,
  readTextFile,
  removeDir,
  removeFile,
  renameFile as tauriRenameFile,
  sep,
  writeBinaryFile,
  writeTextFile,
} from '../wrappers/tauri-wrapper';
import { FILE2_CONTENT, FILE3_CONTENT, INITIAL_CONTENT } from './filesystem.sample-content';

const UPLOADS_DIR = 'uploads';
const EXPORTS_DIR = 'exports';

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
  if (isRunningOnWeb()) {
    for (const file of systemFiles) {
      const relativePath = makeUploadPath(file.name);
      const bytes = await file.arrayBuffer();
      await writeBinaryFileFromWeb(currentProjectId, relativePath, bytes);
    }
    return Array.from(systemFiles).map((file) => file.name);
  } else {
    // Ensure uploads dir
    const systemUploadsDir = await getSystemPath(getUploadsDir());
    if (!(await exists(systemUploadsDir))) {
      await createDir(systemUploadsDir);
    }

    for (const file of systemFiles) {
      const bytes = await file.arrayBuffer();
      const systemUploadFilePath = await getSystemPath(makeUploadPath(file.name));
      await writeBinaryFile(systemUploadFilePath, bytes);
    }
    return Array.from(systemFiles).map((file) => file.name);
  }
}

// #####################################################################################
// Open Project Structure and read project files
// #####################################################################################
export async function newProject(projectPath: string) {
  try {
    setProjectBaseDir(projectPath);
    const systemBaseDir = await getSystemPath('');

    if (await exists(systemBaseDir)) {
      await removeDir(systemBaseDir, { recursive: true });
    }

    await createDir(systemBaseDir, { recursive: true });

    console.log('New project created in folder ', systemBaseDir);
  } catch (err) {
    console.error('ERROR', err);
    throw new Error('Error creating new project in ' + projectPath);
  }
}

export async function openProject(projectPath: string) {
  try {
    setProjectBaseDir(projectPath);
    const systemBaseDir = await getSystemPath('');

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
      await removeDir(systemBaseDir, { recursive: true });
    }

    await createDir(systemBaseDir, { recursive: true });

    await createSampleFiles(true);

    console.log('Sample project open for folder ', systemBaseDir);
  } catch (err) {
    console.error('ERROR', err);
    throw new Error('Error open project in ' + projectPath);
  }
}

let currentProjectId = '';
export function setCurrentProjectId(projectId: string) {
  currentProjectId = projectId;
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
  if (isRunningOnWeb()) {
    console.log('reading file structure from web');
    const entries = await readProjectFilesFromWeb(currentProjectId);
    return Promise.all(entries.map(convertTauriFileEntryToFileEntry));
  } else {
    const systemBaseDir = await getSystemPath('');
    console.log('reading file structure from ', systemBaseDir);
    const entries = await readDir(systemBaseDir, { recursive: true });
    return Promise.all(entries.map(convertTauriFileEntryToFileEntry));
  }
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

// /some/absolute/path/file.txt -> /some/absolute/path
export function getParentFolder(filePath: string) {
  return filePath.split(sep).slice(0, -1).join(sep);
}

// #####################################################################################
// FILE Operations: read, write, delete, rename
// #####################################################################################
export async function writeFileContent(relativePath: string, textContent: string) {
  try {
    if (isRunningOnWeb()) {
      await writeTextFileFromWeb(currentProjectId, relativePath, textContent);
      return true;
    } else {
      const systemPath = await getSystemPath(relativePath);
      await writeTextFile(systemPath, textContent);
      return true;
    }
  } catch (err) {
    console.error('Error', err);
    return false;
  }
}

export async function readFileContent(file: FileFileEntry): Promise<EditorContent> {
  const systemPath = await getSystemPath(file.path);
  switch (file.fileExtension) {
    case 'json': {
      const textContent = isRunningOnWeb()
        ? await readTextFileFromWeb(currentProjectId, file.path)
        : await readTextFile(systemPath);
      return { type: 'json', textContent };
    }
    case 'pdf': {
      const binaryContent = isRunningOnWeb()
        ? await readBinaryFileFromWeb(currentProjectId, file.path)
        : await readBinaryFile(systemPath);
      return { type: 'pdf', binaryContent };
    }
    case 'refstudio':
    case '': {
      const textContent = isRunningOnWeb()
        ? await readTextFileFromWeb(currentProjectId, file.path)
        : await readTextFile(systemPath);

      try {
        const jsonContent = JSON.parse(textContent) as JSONContent;
        return { type: 'refstudio', jsonContent };
      } catch (err) {
        notifyError('Invalid content. Cannot open file:', file.path);
        return { type: 'refstudio', jsonContent: [] };
      }
    }
    default: {
      const textContent = isRunningOnWeb()
        ? await readTextFileFromWeb(currentProjectId, file.path)
        : await readTextFile(systemPath);

      return { type: 'text', textContent };
    }
  }
}

export async function deleteFile(relativePath: string): Promise<boolean> {
  try {
    if (isRunningOnWeb()) {
      await deleteFileFromWeb(currentProjectId, relativePath);
      return true;
    } else {
      const systemPath = await getSystemPath(relativePath);
      await removeFile(systemPath);
      return true;
    }
  } catch (err) {
    console.error('Error', err);
    return false;
  }
}

export async function renameFile(relativePath: string, newName: string): RenameFileResult {
  try {
    if (isRunningOnWeb()) {
      const newRelativePath = getRefStudioPath(newName);
      await renameFileFromWeb(currentProjectId, relativePath, newRelativePath);
      return { success: true, newPath: newRelativePath };
    } else {
      const systemPath = await getSystemPath(relativePath);
      const newSystemPath = await join(getParentFolder(systemPath), newName);
      if (await exists(newSystemPath)) {
        console.warn(`Another file with the same name already exists: ${newSystemPath}`);
        return { success: false };
      }
      await tauriRenameFile(systemPath, newSystemPath);
      const newRelativePath = getRefStudioPath(newSystemPath);
      return { success: true, newPath: newRelativePath };
    }
  } catch (err) {
    console.error('Error', err);
    return { success: false };
  }
}
type RenameFileResult = Promise<{ success: false } | { success: true; newPath: string }>;

export async function exportReferences(references: ReferenceItem[]) {
  try {
    const exportsDir = getExportsDir();
    const systemExportsDir = await getSystemPath(exportsDir);
    if (!(await exists(systemExportsDir))) {
      await createDir(systemExportsDir);
    }

    const serializedReferences = serializeReferences(references);

    const defaultPath = await join(systemExportsDir, `references.${serializedReferences.extension}`);

    const filePath = await save({
      title: 'Export References',
      defaultPath,
      filters: [{ name: serializedReferences.extension, extensions: [serializedReferences.extension] }],
    });
    if (filePath) {
      return writeTextFile(filePath, serializedReferences.textContent);
    }
  } catch (err) {
    console.error('Error', err);
  }
}

export async function saveAsMarkdown(markdownSerializer: MarkdownSerializer, exportedFilePath: string) {
  try {
    const exportsDir = getExportsDir();
    const systemExportsDir = await getSystemPath(exportsDir);
    if (!(await exists(systemExportsDir))) {
      await createDir(systemExportsDir);
    }

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

    const markdownFilePath = [systemExportsDir, markdownFileName].join(sep);

    const filePath = await save({
      title: 'Export file as Markdown',
      defaultPath: await getSystemPath(markdownFilePath),
      filters: [{ name: 'Markdown', extensions: ['md'] }],
    });

    if (filePath) {
      const filePathParts = filePath.split(sep);
      const newFileName = filePathParts.pop();
      if (newFileName) {
        const newFileNameParts = newFileName.split('.');
        const newFileNameWithoutExtension =
          newFileNameParts.length > 1 ? newFileNameParts.slice(0, -1).join('.') : newFileName;

        const serializedContent = markdownSerializer.serialize(newFileNameWithoutExtension);

        if (!serializedContent.bibliography) {
          return writeTextFile(filePath, serializedContent.markdownContent);
        }

        const bibliographyFilePath = [
          ...filePathParts,
          `${newFileNameWithoutExtension}.${serializedContent.bibliography.extension}`,
        ].join(sep);

        return Promise.all([
          writeTextFile(filePath, serializedContent.markdownContent),
          writeTextFile(bibliographyFilePath, serializedContent.bibliography.textContent),
        ]);
      }
    }
  } catch (err) {
    console.error('Error', err);
  }
}
