import { Atom } from 'jotai';
import { Loadable } from 'jotai/vanilla/utils/loadable';

import { FileContent } from './FileContent';
import { FileData, FileId } from './FileData';

export type PaneId = 'LEFT' | 'RIGHT';

export interface PaneFileId {
  paneId: PaneId;
  fileId: FileId;
}
export interface PaneState {
  openFiles: FileId[];
  activeFile?: FileId;
}

export interface PaneContent {
  id: PaneId;
  files: FileData[];
  activeFile?: FileId;
  activeFileContent?: Atom<Loadable<FileContent>>;
}
