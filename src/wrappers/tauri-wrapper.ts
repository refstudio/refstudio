import { invoke as tauriInvoke } from '@tauri-apps/api';
import * as tauriEvent from '@tauri-apps/api/event';
import * as tauriFs from '@tauri-apps/api/fs';
import * as tauriPath from '@tauri-apps/api/path';

export const invoke: typeof tauriInvoke = (cmd, args) => {
  console.log('invoke', cmd, args);
  if (cmd === 'get_environment_variable') {
    return '';
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
  return null as any;
};

// # @tauri-apps/api/path
export const appConfigDir: typeof tauriPath.appConfigDir = () =>
  Promise.resolve('/Users/refstudio/config/studio.ref.desktop');
export const desktopDir: typeof tauriPath.desktopDir = () => Promise.resolve('/Users/refstudio/Desktop');

// XXX might need to resolve ".." and leading "/"
export const join: typeof tauriPath.join = (...args) => Promise.resolve(args.join(','));

export const sep: typeof tauriPath.sep = '/';

// # @tauri-apps/api/fs
interface FakeFile {
  type: 'file';
  contents: string;
}
interface FakeDir {
  type: 'dir';
}
type FakeNode = FakeFile | FakeDir;
const fs = new Map<string, FakeNode>();
export const createDir: typeof tauriFs.createDir = (dir, options) => {
  if (!options?.recursive) {
    throw new Error('Only recursive creatDir is implemented');
  }
  fs.set(dir, { type: 'dir' });
  return Promise.resolve();
};

export const exists: typeof tauriFs.exists = (file) => Promise.resolve(fs.has(file));

export const readBinaryFile: typeof tauriFs.readBinaryFile = async (filePath) => {
  const f = await readTextFile(filePath);
  return new TextEncoder().encode(f);
};

export const readTextFile: typeof tauriFs.readTextFile = (filePath) => {
  const f = fs.get(filePath);
  if (!f) {
    throw new Error(`File does not exist: ${filePath}`);
  }
  if (f.type === 'dir') {
    throw new Error(`Tried to read directory as file: ${filePath}`);
  }
  return Promise.resolve(f.contents);
};

export const readDir: typeof tauriFs.readDir = async (dir, options) => {
  const entries: tauriFs.FileEntry[] = [];
  for (const [path, node] of fs.entries()) {
    if (path.startsWith(dir)) {
      entries.push({
        path,
        name: path.split('/').slice(-1)[0],
        children: node.type === 'dir' ? await readDir(path, options) : undefined,
      });
    }
  }
  return entries;
};

export const removeDir: typeof tauriFs.removeDir = (dir, options) => {
  if (!options?.recursive) {
    throw new Error('Only recursive removeDir is available');
  }
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
  fs.delete(filePath);
  return Promise.resolve();
};

export const writeTextFile: typeof tauriFs.writeTextFile = (filePathOrObj, contentsOrNone, ...args) => {
  if (args.length) {
    throw new Error('Not implemented.');
  }
  const filePath = typeof filePathOrObj === 'object' ? filePathOrObj.path : filePathOrObj;
  const contents = typeof filePathOrObj === 'object' ? filePathOrObj.contents : (contentsOrNone as string);
  fs.set(filePath, { type: 'file', contents });
  return Promise.resolve();
};

export const writeBinaryFile: typeof tauriFs.writeBinaryFile = (filePathOrObj, contentsOrNone, ...args) => {
  if (args.length) {
    throw new Error('Not implemented.');
  }
  const filePath = typeof filePathOrObj === 'object' ? filePathOrObj.path : filePathOrObj;
  const contents =
    typeof filePathOrObj === 'object' ? filePathOrObj.contents : (contentsOrNone as tauriFs.BinaryFileContents);
  fs.set(filePath, { type: 'file', contents: contents as string /* this is a lie */ });
  return Promise.resolve();
};

export const renameFile: typeof tauriFs.renameFile = (oldPath, newPath, options) => {
  if (options) {
    throw new Error('Not implemented');
  }
  const oldFile = fs.get(oldPath);
  if (!oldFile) {
    throw new Error(`Tried to rename ${oldPath} which does not exist.`);
  }
  if (oldFile.type === 'dir') {
    throw new Error('Renaming directores is not implemented');
  }
  fs.delete(oldPath);
  fs.set(newPath, oldFile);
  return Promise.resolve();
};

// # @tauri-apps/api/event
export const emit: typeof tauriEvent.emit = (event, payload) => {
  console.log('emit', event, payload);
  return Promise.resolve();
};

export const listen: typeof tauriEvent.listen = (event, callback) => {
  console.log('listen', event);
  return Promise.resolve(() => {
    /* no op */
  });
};
