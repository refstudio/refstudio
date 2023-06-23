import { VscFile } from 'react-icons/vsc';

import { FileData, FileId } from '../atoms/types/FileData';
import { FileNode, RightAction } from './FileNode';

interface FilesListProps {
  files: FileData[];
  onClick: (fileId: FileId) => void;
  paddingLeft?: string;
  rightAction?: (file: FileId) => RightAction;
  selectedFiles: FileId[];
}

export function FilesList({ files, onClick, paddingLeft, rightAction, selectedFiles }: FilesListProps) {
  return files.map((file) => (
    <FileNode
      VscIcon={VscFile}
      fileName={file.fileName}
      key={file.fileId}
      paddingLeft={paddingLeft}
      rightAction={rightAction?.(file.fileId)}
      selected={selectedFiles.includes(file.fileId)}
      onClick={() => onClick(file.fileId)}
    />
  ));
}
