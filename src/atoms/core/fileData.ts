import { atom } from 'jotai';

import { FileData, FileId } from '../types/FileData';

/** This atom contains data about open files */
export const filesDataAtom = atom<Map<FileId, FileData>>(new Map());

/** Stores data for a file when opening it */
export const addFileData = atom(null, (get, set, file: FileData) => {
  const updatedFilesData = new Map(get(filesDataAtom));
  updatedFilesData.set(file.fileId, file);
  set(filesDataAtom, updatedFilesData);
});

/** Removes data from memory when closing the file */
export const removeFileData = atom(null, (get, set, fileId: FileId) => {
  const updatedFilesData = new Map(get(filesDataAtom));

  if (!updatedFilesData.has(fileId)) {
    console.warn('File is not open ', fileId);
    return;
  }

  updatedFilesData.delete(fileId);
  set(filesDataAtom, updatedFilesData);
});
