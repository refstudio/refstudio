/* eslint-disable no-underscore-dangle */
import { atom } from 'jotai';

import { FileFileEntry, FileId } from '../types/FileEntry';

/** This atom contains data about open files */
export const _fileEntryAtom = atom<Map<FileId, FileFileEntry>>(new Map());

/** Stores data for a file when opening it */
export const _addFileEntry = atom(null, (get, set, file: FileFileEntry) => {
  const updatedFileEntries = new Map(get(_fileEntryAtom));
  updatedFileEntries.set(file.path, file);
  set(_fileEntryAtom, updatedFileEntries);
});

/** Removes data from memory when closing the file */
export const _removeFileEntry = atom(null, (get, set, fileId: FileId) => {
  const updatedFileEntries = new Map(get(_fileEntryAtom));

  if (!updatedFileEntries.has(fileId)) {
    console.warn('File is not open ', fileId);
    return;
  }

  updatedFileEntries.delete(fileId);
  set(_fileEntryAtom, updatedFileEntries);
});
