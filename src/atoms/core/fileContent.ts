import { atom } from 'jotai';

import { readFileContent } from '../../io/filesystem';
import { createFileContentAtoms } from '../createFileContentAtoms';
import { FileContent } from '../types/FileContent';
import { FileContentAtoms } from '../types/FileContentAtoms';
import { FileId } from '../types/FileData';
import { FileFileEntry } from '../types/FileEntry';

type FileContentState = ReadonlyMap<FileId, FileContentAtoms>;

/**
 * This atom stores the atoms containing the content of open files.
 * Each fileContent atom is a loadable atom, asynchronously reading files
 */
export const fileContentStateAtom = atom<FileContentState>(new Map());

/** Loads file content in memory when opening a file */
export const loadFile = atom(null, (get, set, file: FileFileEntry) => {
  const currentOpenFiles = get(fileContentStateAtom);
  const updatedMap = new Map(currentOpenFiles);

  updatedMap.set(file.path, createFileContentAtoms(file.path, readFileContent(file)));
  set(fileContentStateAtom, updatedMap);
});

/** Synchronously loads file content in memory */
export const loadFileSync = atom(
  null,
  (get, set, { fileId, fileContent }: { fileId: FileId; fileContent: FileContent }) => {
    const currentOpenFiles = get(fileContentStateAtom);
    const updatedMap = new Map(currentOpenFiles);

    updatedMap.set(fileId, createFileContentAtoms(fileId, fileContent));
    set(fileContentStateAtom, updatedMap);
  },
);

/** Removes the content from memory when closing the file */
export const unloadFile = atom(null, (get, set, fileId: FileId) => {
  const currentOpenFiles = get(fileContentStateAtom);

  if (!currentOpenFiles.has(fileId)) {
    console.warn('File is not open ', fileId);
    return;
  }

  const updatedMap = new Map(currentOpenFiles);
  updatedMap.delete(fileId);
  set(fileContentStateAtom, updatedMap);
});
