/* eslint-disable no-underscore-dangle */
import { atom } from 'jotai';

import { FileFileEntry } from '../../types/FileEntry';
import { FileId } from './atom.types';

/**
 * This atom contains data about open files
 * 2 action atoms are available:
 *  - `_addFileEntry` to store data for a file, when opening it
 *  - `_removeFileEntry` to remove the data from memory, when closing the file
 *
 * NOTE: This is a core atom file and it should never been used outside of the `atoms` directory of this project
 */
export const _fileEntryAtom = atom<Map<FileId, FileFileEntry>>(new Map());

export const _addFileEntry = atom(null, (get, set, file: FileFileEntry) => {
  const updatedFileEntries = new Map(get(_fileEntryAtom));
  updatedFileEntries.set(file.path, file);
  set(_fileEntryAtom, updatedFileEntries);
});

export const _removeFileEntry = atom(null, (get, set, fileId: FileId) => {
  const updatedFileEntries = new Map(get(_fileEntryAtom));
  updatedFileEntries.delete(fileId);
  set(_fileEntryAtom, updatedFileEntries);
});
