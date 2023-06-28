import { FileContentAtoms } from './FileContentAtoms';
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
  activeFileAtoms?: FileContentAtoms;
}
