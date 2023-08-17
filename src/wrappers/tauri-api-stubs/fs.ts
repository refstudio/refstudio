/** Stubs for @tauri-apps/api/fs */

import * as tauriFs from '@tauri-apps/api/fs';

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

export const createDir: typeof tauriFs.createDir = (dir, options) => {
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

export const removeFile: typeof tauriFs.removeFile = (filePath, options) => {
  if (options) {
    throw new Error('Not implemented.');
  }
  fs.delete(normalizePath(filePath));
  return Promise.resolve();
};

export const writeTextFile: typeof tauriFs.writeTextFile = (filePathOrObj, contentsOrNone, ...args) => {
  if (args.length) {
    throw new Error('Not implemented.');
  }
  const filePath = typeof filePathOrObj === 'object' ? filePathOrObj.path : filePathOrObj;
  const contents = typeof filePathOrObj === 'object' ? filePathOrObj.contents : (contentsOrNone as string);
  fs.set(normalizePath(filePath), { type: 'file', contents });
  return Promise.resolve();
};

export const writeBinaryFile: typeof tauriFs.writeBinaryFile = (filePathOrObj, contentsOrNone, ...args) => {
  if (args.length) {
    throw new Error('Not implemented.');
  }
  const filePath = typeof filePathOrObj === 'object' ? filePathOrObj.path : filePathOrObj;
  const contents =
    typeof filePathOrObj === 'object' ? filePathOrObj.contents : (contentsOrNone as tauriFs.BinaryFileContents);
  fs.set(normalizePath(filePath), { type: 'file', contents: contents as string /* this is a lie */ });
  return Promise.resolve();
};

export const renameFile: typeof tauriFs.renameFile = (oldPath, newPath, options) => {
  if (options) {
    throw new Error('Not implemented');
  }
  const normOldPath = normalizePath(oldPath);
  const oldFile = fs.get(normOldPath);
  if (!oldFile) {
    throw new Error(`Tried to rename ${oldPath} which does not exist.`);
  }
  if (oldFile.type === 'dir') {
    throw new Error('Renaming directores is not implemented');
  }
  fs.delete(normOldPath);
  fs.set(normalizePath(newPath), oldFile);
  return Promise.resolve();
};
// (window as any).getFileSystem = () => fs;

export function resetInMemoryFsForTesting() {
  fs.clear();
}
