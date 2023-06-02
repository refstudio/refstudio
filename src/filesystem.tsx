import {
  BaseDirectory,
  createDir,
  FileEntry,
  readBinaryFile,
  readDir,
  readTextFile,
  writeBinaryFile,
  writeTextFile,
} from '@tauri-apps/api/fs';
import { appDataDir, join } from '@tauri-apps/api/path';
import { Command } from '@tauri-apps/api/shell';

import { INITIAL_CONTENT } from './TipTapEditor/TipTapEditorConfigs';

const PROJECT_NAME = 'project-x';
const UPLOADS_DIR = 'uploads';

async function getBaseDir() {
  return join(await appDataDir(), PROJECT_NAME);
}
async function getUploadsDir() {
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
  return sortedFileEntries(entries);
}

export async function uploadFiles(files: FileList) {
  const uploadsDir = await join(await getBaseDir(), UPLOADS_DIR);
  for (const file of files) {
    const path = await join(uploadsDir, file.name);
    const bytes = await file.arrayBuffer();
    await writeBinaryFile(path, bytes, { dir: BaseDirectory.Home });
  }
}

export async function runPDFIngestion() {
  const uploadsDir = await getUploadsDir();
  const command = Command.sidecar('bin/python/main', ['ingest', '--pdf_directory', `${uploadsDir.toString()}`]);
  console.log('command', command);
  const output = await command.execute();
  const response = JSON.parse(output.stdout) as object; // TODO: adopt a better type here :-)
  console.log('response', response);
  return response;
}

export async function readFileEntryAsBinary(file: FileEntry) {
  return readBinaryFile(file.path);
}

export async function readFileEntryAsText(file: FileEntry) {
  return readTextFile(file.path);
}

function sortedFileEntries(entries: FileEntry[]): FileEntry[] {
  return entries
    .sort((fileA, fileB) => {
      if (fileA.children === undefined) {
        return -1;
      }
      if (fileB.children === undefined) {
        return 1;
      }
      return fileA.name?.localeCompare(fileB.name ?? '') ?? 0;
    })
    .map((entry) => ({
      ...entry,
      children: entry.children ? sortedFileEntries(entry.children) : entry.children,
    }));
}
