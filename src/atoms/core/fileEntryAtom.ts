/* eslint-disable no-underscore-dangle */
import { atom } from 'jotai';

import { FileFileEntry } from '../../types/FileEntry';
import { FileId } from './atom.types';

// Base atom
export const _fileEntryAtom = atom<Map<FileId, FileFileEntry>>(new Map());

// Action atoms
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
