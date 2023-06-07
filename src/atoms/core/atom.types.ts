export type PaneId = 'LEFT' | 'RIGHT';

export type FileId = string;

export interface PaneFileId {
  paneId: PaneId;
  fileId: FileId;
}
