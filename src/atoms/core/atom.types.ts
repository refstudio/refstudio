export type PaneId = 'LEFT' | 'RIGHT';

export type FileId = string;

export interface PaneFileId {
  paneId: PaneId;
  fileId: FileId;
}
export interface PaneState {
  openFiles: FileId[];
  activeFile?: FileId;
}
