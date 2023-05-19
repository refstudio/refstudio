import { TipTapEditor } from '../TipTapEditor/TipTapEditor';
import { EditorProps } from '../types/EditorProps';

export function EditorView(props: EditorProps) {
  return (
    <div>
      <TipTapEditor {...props} />
    </div>
  );
}
