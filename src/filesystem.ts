import {
  BaseDirectory,
  copyFile as tauriCopyFile,
  createDir,
  FileEntry as TauriFileEntry,
  readBinaryFile,
  readDir,
  readTextFile,
  writeBinaryFile,
  writeTextFile,
} from '@tauri-apps/api/fs';
import { appDataDir, join } from '@tauri-apps/api/path';

import { FileContent } from './atoms/types/FileContent';
import { FileEntry, FileFileEntry } from './atoms/types/FileEntry';
import { isNonNullish } from './lib/isNonNullish';
import { INITIAL_CONTENT } from './TipTapEditor/TipTapEditorConfigs';

const PROJECT_NAME = 'project-x';
const UPLOADS_DIR = 'uploads';

async function getBaseDir() {
  return join(await appDataDir(), PROJECT_NAME);
}
export async function getUploadsDir() {
  return join(await getBaseDir(), UPLOADS_DIR);
}
export async function ensureProjectFileStructure() {
  try {
    const baseDir = await getBaseDir();
    await createDir(baseDir, { recursive: true });
    await createDir(await join(baseDir, UPLOADS_DIR), { recursive: true });

    // Create sample files
    await writeTextFile(await join(baseDir, 'file 1.tiptap'), INITIAL_CONTENT);
    await writeTextFile(await join(baseDir, 'file 2.tiptap'), '# Heading');

    console.log('Project structure created with success. Folder: ', baseDir);

    return baseDir;
  } catch (err) {
    console.error('ERROR', err);
    throw new Error('Error ensuring file struture');
  }
}
export async function readAllProjectFiles() {
  const entries = await readDir(await getBaseDir(), { recursive: true });
  const fileEntries = entries.map(convertTauriFileEntryToFileEntry);
  return sortedFileEntries(fileEntries);
}

export async function copyFiles(filePaths: string[]) {
  return (await Promise.all(filePaths.map(copyFile))).filter(isNonNullish);
}

export async function copyFile(filePath: string) {
  try {
    const filename = filePath.split('/').pop();
    if (!filename) {
      return null;
    }
    const targetFilePath = await join(await getBaseDir(), UPLOADS_DIR, filename);
    await tauriCopyFile(filePath, targetFilePath);
    return targetFilePath;
  } catch (err) {
    console.error('Error', err);
  }
}

export async function uploadFiles(files: FileList) {
  const uploadsDir = await join(await getBaseDir(), UPLOADS_DIR);
  for (const file of files) {
    const path = await join(uploadsDir, file.name);
    const bytes = await file.arrayBuffer();
    await writeBinaryFile(path, bytes, { dir: BaseDirectory.Home });
  }
}

export async function readFileContent(file: FileFileEntry): Promise<FileContent> {
  switch (file.fileExtension) {
    case 'xml': {
      const textContent = await readTextFile(file.path);
      return { type: 'xml', textContent };
    }
    case 'json': {
      const textContent = await readTextFile(file.path);
      return { type: 'json', textContent };
    }
    case 'pdf': {
      const binaryContent = await readBinaryFile(file.path);
      return { type: 'pdf', binaryContent };
    }
    default: {
      const textContent = await readTextFile(file.path);
      return { type: 'tiptap', textContent };
    }
  }
}

function convertTauriFileEntryToFileEntry(entry: TauriFileEntry): FileEntry {
  const isFolder = !!entry.children;

  const name = entry.name ?? '';
  const isDotfile = name.startsWith('.');

  if (isFolder) {
    return {
      name,
      path: entry.path,
      isFolder,
      isFile: !isFolder,
      isDotfile,
      children: entry.children!.map(convertTauriFileEntryToFileEntry),
    };
  } else {
    const fileExtension = name.split('.').pop()?.toLowerCase() ?? '';
    return {
      name,
      path: entry.path,
      fileExtension,
      isFolder,
      isDotfile,
      isFile: !isFolder,
    };
  }
}

function sortedFileEntries(entries: FileEntry[]): FileEntry[] {
  return entries
    .sort((fileA, fileB) => {
      if (fileA.isFile) {
        return -1;
      }
      if (fileB.isFile) {
        return 1;
      }
      return fileA.name.localeCompare(fileB.name);
    })
    .map((entry) => {
      if (entry.isFile) {
        return entry;
      } else {
        return {
          ...entry,
          children: sortedFileEntries(entry.children),
        };
      }
    });
}
