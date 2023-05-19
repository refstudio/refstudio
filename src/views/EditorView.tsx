import LexicalEditor from '../LexicalEditor/LexicalEditor';
import { TipTapEditor } from '../TipTapEditor/TipTapEditor';
import { EditorProps } from '../types/EditorProps';

export function EditorView(
  props: EditorProps & { editor: 'TipTap' | 'Lexical' },
) {
  return (
    <div>
      {props.editor === 'TipTap' && <TipTapEditor {...props} />}
      {props.editor === 'Lexical' && <LexicalEditor {...props} />}
    </div>
  );
}
