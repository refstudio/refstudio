/* eslint-disable no-underscore-dangle */
import { Atom, atom } from 'jotai';
import { loadable } from 'jotai/utils';
import { Loadable } from 'jotai/vanilla/utils/loadable';

import { readFileContent } from '../../filesystem';
import { FileContent } from '../types/FileContent';
import { FileFileEntry, FileId } from '../types/FileEntry';

type FileContentState = ReadonlyMap<FileId, Atom<Loadable<FileContent>>>;

/**
 * This atom stores the atoms containing the content of open files.
 * Each fileContent atom is a loadable atom, asynchronously reading files
 */
export const _fileContentAtom = atom<FileContentState>(new Map());

/** Loads file content in memory when opening a file */
export const _loadFile = atom(null, (get, set, file: FileFileEntry) => {
  const currentOpenFiles = get(_fileContentAtom);
  const updatedMap = new Map(currentOpenFiles);
  const fileAtom = loadable(atom(() => readFileContent(file)));
  updatedMap.set(file.path, fileAtom);
  set(_fileContentAtom, updatedMap);
});

/** Removes the content from memory when closing the file */
export const _unloadFile = atom(null, (get, set, fileId: FileId) => {
  const currentOpenFiles = get(_fileContentAtom);

  if (!currentOpenFiles.has(fileId)) {
    console.warn('File is not open ', fileId);
    return;
  }

  const updatedMap = new Map(currentOpenFiles);
  updatedMap.delete(fileId);
  set(_fileContentAtom, updatedMap);
});
