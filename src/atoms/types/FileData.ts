export type FileId = string;

export interface FileData {
  fileId: FileId;
  fileName: string;
  isDirty?: boolean;
}
