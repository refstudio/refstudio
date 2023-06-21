/* eslint-disable no-underscore-dangle */
import { Atom, atom } from 'jotai';
import { loadable } from 'jotai/utils';
import { Loadable } from 'jotai/vanilla/utils/loadable';

import { readFileContent } from '../../filesystem';
import { FileContent } from '../types/FileContent';
import { FileId } from '../types/FileData';
import { FileFileEntry } from '../types/FileEntry';

type FileContentState = ReadonlyMap<FileId, Atom<Loadable<FileContent>>>;

/**
 * This atom stores the atoms containing the content of open files.
 * Each fileContent atom is a loadable atom, asynchronously reading files
 */
export const fileContentAtom = atom<FileContentState>(new Map());

/** Loads file content in memory when opening a file */
export const loadFile = atom(null, (get, set, file: FileFileEntry) => {
  const currentOpenFiles = get(fileContentAtom);
  const updatedMap = new Map(currentOpenFiles);
  const fileAtom = loadable(atom(() => readFileContent(file)));
  updatedMap.set(file.path, fileAtom);
  set(fileContentAtom, updatedMap);
});

/** Synchronously loads file content in memory */
export const loadFileSync = atom(
  null,
  (get, set, { fileId, fileContent }: { fileId: FileId; fileContent: FileContent }) => {
    const currentOpenFiles = get(fileContentAtom);
    const updatedMap = new Map(currentOpenFiles);
    const fileAtom = loadable(atom(() => fileContent));
    updatedMap.set(fileId, fileAtom);
    set(fileContentAtom, updatedMap);
  },
);

/** Removes the content from memory when closing the file */
export const unloadFile = atom(null, (get, set, fileId: FileId) => {
  const currentOpenFiles = get(fileContentAtom);

  if (!currentOpenFiles.has(fileId)) {
    console.warn('File is not open ', fileId);
    return;
  }

  const updatedMap = new Map(currentOpenFiles);
  updatedMap.delete(fileId);
  set(fileContentAtom, updatedMap);
});
