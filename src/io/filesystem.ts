import {
  BaseDirectory,
  createDir,
  exists,
  FileEntry as TauriFileEntry,
  readBinaryFile,
  readDir,
  readTextFile,
  removeFile,
  writeBinaryFile,
  writeTextFile,
} from '@tauri-apps/api/fs';
import { appConfigDir, appDataDir, join } from '@tauri-apps/api/path';

import { EditorContent } from '../atoms/types/EditorContent';
import { FileEntry, FileFileEntry } from '../atoms/types/FileEntry';
import { INITIAL_CONTENT } from '../features/textEditor/components/tipTapEditorConfigs';

const FILE2_CONTENT = `# Lorem Buzzword

We will regenerate our aptitude to evolve without decreasing our power to syndicate. Without development, you will lack cross-media CAE. A company that can streamline elegantly will (at some unspecified point in the future) be able to orchestrate correctly. The capacity to enable perfectly leads to the capacity to harness without devaluing our power to deliver. Do you have a infinitely reconfigurable scheme for coping with emerging methodologies? Is it more important for something to be dynamic or to be dynamic or to be leading-edge or to be dynamic or to be leading-edge or to be dynamic or to be best-of-breed? The portals factor can be delivered as-a-service to wherever it’s intended to go – mobile. It may seem mixed-up, but it's 100 percent true! Your budget for innovating should be at least one-half of your budget for innovating should be at least one-half of your budget for innovating should be at least one-half of your budget for innovating should be at least one-half of your budget for engaging should be at least one-half of your budget for harnessing. Our feature set is second to none, but our vertical, customized efficient, user-centric TQM and non-complex use is invariably considered a remarkable achievement.

Without niches, you will lack affiliate-based compliance. A company that can synthesize courageously will (eventually) be able to engineer virtually than to strategize macro-intuitively. Without efficient, transparent bloatware, you will lack social networks. If all of this sounds astonishing to you, that's because it is! Quick: do you have a infinitely reconfigurable scheme for coping with emerging methodologies? Is it more important for something to be dynamic or to be customer-directed? What does the buzzword 'technologies' really mean? Think virally-distributed. Our functionality is unparalleled, but our C2C2C paradigms and easy use is usually considered a terrific achievement. We think that most C2C2C web-based applications use far too much Python, and not enough Java. Have you ever been unable to disintermediate your feature set? Free? We apply the proverb 'A rolling stone gathers no moss' not only to our power to repurpose. Our functionality is unparalleled, but our power to deliver. That is a remarkable achievement taking into account this month's financial state of things! If all of this comes off as mixed-up to you, that's because it is! What does the buzzword 'technologies' really mean? Think virally-distributed. Quick: do you have a infinitely reconfigurable scheme for coping with emerging methodologies? Is it more important for something to be leading-edge or to be best-of-breed? The portals factor can be summed up in one word: affiliate-based.

`;

const FILE3_CONTENT = `# Rewrite

In the cycling world, power meters are the typical way to objectively measure performance. Your speed is dependent on a lot of factors, like wind, road surface, and elevation. One's heart rate is largely a function of genetics, but also things like temperature. The amount of power you are outputting to the pedals though, is a direct measure of how much work you're doing, regardless of wind, elevation, your body weight, etc.

`;

const PROJECT_NAME = 'project-x';
export const UPLOADS_DIR = 'uploads';

export async function getConfigDir() {
  return appConfigDir();
}

export async function getAppDataDir() {
  return appDataDir();
}

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

    await ensureFile(baseDir, 'file 1.refstudio', INITIAL_CONTENT);
    await ensureFile(baseDir, 'file 2.refstudio', FILE2_CONTENT);
    await ensureFile(baseDir, 'file 3.refstudio', FILE3_CONTENT);

    console.log('Project structure created with success. Folder: ', baseDir);
  } catch (err) {
    console.error('ERROR', err);
    throw new Error('Error ensuring file struture');
  }
}

async function ensureFile(baseDir: string, fileName: string, content: string) {
  const path = await join(baseDir, fileName);
  if (!(await exists(path))) {
    await writeTextFile(path, content);
  }
}

export async function readAllProjectFiles() {
  const baseDir = await getBaseDir();
  const entries = await readDir(baseDir, { recursive: true });
  return entries.map((entry) => convertTauriFileEntryToFileEntry(entry, baseDir));
}

export async function writeFileContent(relativePath: string, textContent: string) {
  try {
    const path = (await getBaseDir()) + relativePath;
    await writeTextFile(path, textContent);
    return true;
  } catch (err) {
    console.error('Error', err);
    return false;
  }
}

export async function uploadFiles(files: File[]) {
  console.log('upload', files);
  const uploadsDir = await join(await getBaseDir(), UPLOADS_DIR);
  for (const file of files) {
    const path = await join(uploadsDir, file.name);
    const bytes = await file.arrayBuffer();
    await writeBinaryFile(path, bytes, { dir: BaseDirectory.Home });
  }
  return Array.from(files).map((file) => file.name);
}

export async function readFileContent(file: FileFileEntry): Promise<EditorContent> {
  const path = (await getBaseDir()) + file.path;
  switch (file.fileExtension) {
    case 'xml': {
      const textContent = await readTextFile(path);
      return { type: 'xml', textContent };
    }
    case 'json': {
      const textContent = await readTextFile(path);
      return { type: 'json', textContent };
    }
    case 'pdf': {
      const binaryContent = await readBinaryFile(path);
      return { type: 'pdf', binaryContent };
    }
    default: {
      const textContent = await readTextFile(path);
      return { type: 'text', textContent };
    }
  }
}

function convertTauriFileEntryToFileEntry(entry: TauriFileEntry, baseDir: string): FileEntry {
  const isFolder = !!entry.children;

  const name = entry.name ?? '';
  const isDotfile = name.startsWith('.');

  const relativePath = entry.path.replace(new RegExp(`^${baseDir}`), '');

  if (isFolder) {
    return {
      name,
      path: relativePath,
      isFolder,
      isFile: !isFolder,
      isDotfile,
      children: entry.children!.map((child) => convertTauriFileEntryToFileEntry(child, baseDir)),
    };
  } else {
    const fileExtension = name.split('.').pop()?.toLowerCase() ?? '';
    return {
      name,
      path: relativePath,
      fileExtension,
      isFolder,
      isDotfile,
      isFile: !isFolder,
    };
  }
}

export async function deleteFile(relativePath: string): Promise<boolean> {
  const path = (await getBaseDir()) + relativePath;
  try {
    await removeFile(path);
    return true;
  } catch (err) {
    console.error('Error', err);
    return false;
  }
}
