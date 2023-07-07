import { atom, Getter } from 'jotai';

import { readAllProjectFiles } from '../io/filesystem';
import { fileExplorerEntriesAtom } from './core/fileExplorerEntry';
import { FileExplorerEntry } from './types/FileExplorerEntry';

export const fileExplorerAtom = atom((get) => get(fileExplorerEntriesAtom));

export const refreshFileTreeAtom = atom(null, async (get, set) => {
  const projectFiles = await readAllProjectFiles();
  const fileExplorerEntries = get(fileExplorerEntriesAtom);
  set(fileExplorerEntries.childrenAtom, projectFiles);
});

export const getFileExplorerEntryFromPathAtom = (filePath: string) =>
  atom((get) => getFileExplorerEntryFromPath(filePath.split('/').slice(1), get));

function getFileExplorerEntryFromPath(
  path: string[],
  get: Getter,
  fileExplorerEntry: FileExplorerEntry = get(fileExplorerAtom),
): FileExplorerEntry | null {
  if (path.length === 0) {
    return fileExplorerEntry;
  }

  if (!fileExplorerEntry.isFolder) {
    return null;
  }

  const [nextLevelEntryName, ...rest] = path;

  const nextLevelEntry = get(fileExplorerEntry.childrenAtom).find(
    (childEntry) => childEntry.name === nextLevelEntryName,
  );
  if (!nextLevelEntry) {
    return null;
  }

  return getFileExplorerEntryFromPath(rest, get, nextLevelEntry);
}

export { pathBeingRenamed as fileExplorerEntryPathBeingRenamed } from './core/fileExplorerEntry';
