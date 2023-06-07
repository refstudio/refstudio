/* eslint-disable no-underscore-dangle */
import { Atom, atom } from 'jotai';
import { loadable } from 'jotai/utils';
import { Loadable } from 'jotai/vanilla/utils/loadable';

import { readFileContent } from '../../filesystem';
import { FileContent } from '../../types/FileContent';
import { FileFileEntry } from '../../types/FileEntry';
import { FileId } from './atom.types';

type FileContentState = Map<FileId, Atom<Loadable<Promise<FileContent>>>>;

/**
 * This atom stores the atoms containing the content of open files.
 * Each fileContent atom is a loadable atom, asynchronously reading files
 *
 * 2 action atoms are available:
 *  - `_loadFileInMemory` to load file content in memory when opening a file
 *  - `_unloadFileFromMemory` to remove the content from memory when closing the file
 *
 * NOTE: This is a core atom file and it should never been used outside of the `atoms` directory of this project
 */
export const _fileContentAtom = atom<FileContentState>(new Map());

export const _loadFileInMemory = atom(null, (get, set, file: FileFileEntry) => {
  const currentOpenFiles = get(_fileContentAtom);
  const updatedMap = new Map(currentOpenFiles);
  const fileAtom = loadable(
    atom(async () => {
      const fileContent = await readFileContent(file);
      return fileContent;
    }),
  );
  updatedMap.set(file.path, fileAtom);
  set(_fileContentAtom, updatedMap);
});

export const _unloadFileFromMemory = atom(null, (get, set, fileId: FileId) => {
  const currentOpenFiles = get(_fileContentAtom);
  const updatedMap = new Map(currentOpenFiles);
  updatedMap.delete(fileId);
  set(_fileContentAtom, updatedMap);
});
