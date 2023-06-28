import { VscFile } from 'react-icons/vsc';

import { EditorData, EditorId } from '../atoms/types/EditorData';
import { FileNode, RightAction } from './FileNode';

interface EditorsListProps {
  editors: EditorData[];
  onClick: (editorId: EditorId) => void;
  paddingLeft?: string;
  rightAction?: (file: EditorId) => RightAction;
  selectedEditors: EditorId[];
}

export function EditorsList({ editors, onClick, paddingLeft = '0', rightAction, selectedEditors }: EditorsListProps) {
  return (
    <>
      {editors.map((editor) => (
        <FileNode
          VscIcon={VscFile}
          fileName={editor.title}
          key={editor.id}
          paddingLeft={paddingLeft}
          rightAction={rightAction?.(editor.id)}
          selected={selectedEditors.includes(editor.id)}
          onClick={() => onClick(editor.id)}
        />
      ))}
    </>
  );
}
