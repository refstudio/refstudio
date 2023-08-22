/** Stubs for @tauri-apps/api/fs */

import * as tauriFs from '@tauri-apps/api/fs';

import { deleteRemoteFile, getRemoteFile, writeRemotePdfFile, writeRemoteTextFile } from '../../api/filesystemAPI';
import { getRemoteProject } from '../../api/projectsAPI';

const PROJECT_ID = '4648e1f2-a89b-4752-960f-2ba74a0dc38c';

interface FakeFile {
  type: 'file';
  contents: string;
}
interface FakeDir {
  type: 'dir';
}
type FakeNode = FakeFile | FakeDir;
type NormalizedPath = string & { _brand: 'normalized' };
// Remove some "warts" from paths, e.g. "//"
function normalizePath(path: string): NormalizedPath {
  let prefix = '';
  if (path.startsWith('/')) {
    prefix = '/';
    path = path.slice(1);
  }
  return (prefix +
    path
      .split('/')
      .filter((x) => !!x)
      .join('/')) as NormalizedPath;
}
const fs = new Map<NormalizedPath, FakeNode>();

export const createDir: typeof tauriFs.createDir = async (dir, options) => {
  if (!options?.recursive) {
    throw new Error('Only recursive createDir is implemented');
  }
  fs.set(normalizePath(dir), { type: 'dir' });
  return Promise.resolve();
};

export const exists: typeof tauriFs.exists = (file) => Promise.resolve(fs.has(normalizePath(file)));

export const readBinaryFile: typeof tauriFs.readBinaryFile = async (filePath) => {
  const f = await readTextFile(filePath);
  return new TextEncoder().encode(f);
};

export const readTextFile: typeof tauriFs.readTextFile = (filePath) => {
  const f = fs.get(normalizePath(filePath));
  if (!f) {
    throw new Error(`File does not exist: ${filePath}`);
  }
  if (f.type === 'dir') {
    throw new Error(`Tried to read directory as file: ${filePath}`);
  }
  return Promise.resolve(f.contents);
};

export const readDir: typeof tauriFs.readDir = async (dir, options) => {
  console.log('READ DIR for ', dir);
  dir = normalizePath(dir);
  const entries: tauriFs.FileEntry[] = [];
  for (const [path, node] of fs.entries()) {
    if (path.startsWith(dir) && path !== dir && !path.slice(dir.length + 1).includes('/')) {
      entries.push({
        path,
        name: path.split('/').slice(-1)[0],
        children: node.type === 'dir' && options?.recursive ? await readDir(path, options) : undefined,
      });
    }
  }

  const projectInfo = await getRemoteProject(PROJECT_ID);
  const paths = projectInfo.filepaths.map((path) => path.replace(projectInfo.project_path, ''));
  return paths.map((path) => ({
    path,
    name: path.split('/').slice(-1)[0],
    children: undefined,
  }));

  return entries;
};

export const removeDir: typeof tauriFs.removeDir = (dir, options) => {
  if (!options?.recursive) {
    throw new Error('Only recursive removeDir is available');
  }
  dir = normalizePath(dir);
  for (const path of fs.keys()) {
    if (path.startsWith(dir)) {
      fs.delete(path);
    }
  }
  return Promise.resolve();
};

export const removeFile: typeof tauriFs.removeFile = async (filePath, options) => {
  if (options) {
    throw new Error('Not implemented.');
  }
  fs.delete(normalizePath(filePath));
  // FS API CALL
  await deleteRemoteFile(PROJECT_ID, filePath);
};

export const writeTextFile: typeof tauriFs.writeTextFile = async (filePathOrObj, contentsOrNone, ...args) => {
  if (args.length) {
    throw new Error('Not implemented.');
  }
  const filePath = typeof filePathOrObj === 'object' ? filePathOrObj.path : filePathOrObj;
  const contents = typeof filePathOrObj === 'object' ? filePathOrObj.contents : (contentsOrNone as string);
  fs.set(normalizePath(filePath), { type: 'file', contents });
  // FS API CALL
  await writeRemoteTextFile(PROJECT_ID, normalizePath(filePath), contents);
};

export const writeBinaryFile: typeof tauriFs.writeBinaryFile = async (filePathOrObj, contentsOrNone, ...args) => {
  if (args.length) {
    throw new Error('Not implemented.');
  }
  const filePath = typeof filePathOrObj === 'object' ? filePathOrObj.path : filePathOrObj;
  const contents =
    typeof filePathOrObj === 'object' ? filePathOrObj.contents : (contentsOrNone as tauriFs.BinaryFileContents);
  fs.set(normalizePath(filePath), { type: 'file', contents: contents as string /* this is a lie */ });
  // FS API CALL
  await writeRemotePdfFile(PROJECT_ID, normalizePath(filePath), contents as ArrayBuffer);
};

export const renameFile: typeof tauriFs.renameFile = async (oldPath, newPath, options) => {
  if (options) {
    throw new Error('Not implemented');
  }
  const normOldPath = normalizePath(oldPath);
  const oldFile = fs.get(normOldPath);
  if (!oldFile) {
    throw new Error(`Tried to rename ${oldPath} which does not exist.`);
  }
  if (oldFile.type === 'dir') {
    throw new Error('Renaming directories is not implemented');
  }
  fs.delete(normOldPath);
  const normNewPath = normalizePath(newPath);
  fs.set(normNewPath, oldFile);

  // FS API CALL
  const data = await getRemoteFile(PROJECT_ID, normOldPath);
  await deleteRemoteFile(PROJECT_ID, normOldPath);
  if (data instanceof ArrayBuffer) {
    await writeRemotePdfFile(PROJECT_ID, normNewPath, data);
  } else {
    await writeRemoteTextFile(PROJECT_ID, normNewPath, data);
  }
};

export function resetInMemoryFsForTesting() {
  fs.clear();
}
