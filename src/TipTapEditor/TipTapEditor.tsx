import './TipTapEditor.css';

import { Editor, EditorContent } from '@tiptap/react';
import { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';

import { selectionState } from '../atoms/selectionState';
import { EditorProps } from '../types/EditorProps';
import { MenuBar } from './MenuBar';
import { ReferenceNode } from './ReferenceBlock/ReferenceNode';
import { EDITOR_EXTENSIONS, INITIAL_CONTENT } from './TipTapEditorConfigs';

export function TipTapEditor({ editorRef, editorContent }: EditorProps) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const setSelection = useSetRecoilState(selectionState);

  useEffect(() => {
    setEditor(
      new Editor({
        extensions: EDITOR_EXTENSIONS,
        content: editorContent ?? INITIAL_CONTENT,
        onSelectionUpdate({ editor }) {
          const { from, to } = editor.view.state.selection;
          const text = editor.view.state.doc.textBetween(from, to);
          setSelection(text);
        },
      }),
    );
  }, [editorContent, setSelection]);

  useEffect(() => {
    if (!editor) return;
    editorRef.current = {
      insertReference(reference) {
        editor?.commands.insertContentAt(editor.state.selection.head, {
          type: ReferenceNode.name,
          attrs: { id: reference.id },
        });
      },
    };
  }, [editor, editorRef]);

  if (!editor) return <div>...</div>;

  return (
    <div className="tiptap-editor">
      <MenuBar editor={editor} />
      <EditorContent className="px-2" editor={editor} />
    </div>
  );
}
