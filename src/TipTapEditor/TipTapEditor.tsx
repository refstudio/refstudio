import './TipTapEditor.css';

import { Editor, EditorContent } from '@tiptap/react';
import { useEffect, useState } from 'react';

import { EditorProps } from '../types/EditorProps';
import { MenuBar } from './MenuBar';
import { ReferenceNode } from './ReferenceBlock/ReferenceNode';
import { EDITOR_EXTENSIONS, INITIAL_CONTENT } from './TipTapEditorConfigs';

export function TipTapEditor({ editorRef, editorContent, onSelectionChange }: EditorProps) {
  const [editor, setEditor] = useState<Editor | null>(null);
  useEffect(() => {
    setEditor(
      new Editor({
        extensions: EDITOR_EXTENSIONS,
        content: editorContent ?? INITIAL_CONTENT,
        onSelectionUpdate(update) {
          const newEditor = update.editor;
          const { from, to } = newEditor.view.state.selection;
          onSelectionChange(newEditor.view.state.doc.textBetween(from, to));
        },
      }),
    );
  }, [editorContent, onSelectionChange]);

  useEffect(() => {
    if (!editor) {
      return;
    }
    editorRef.current = {
      insertReference(reference) {
        editor.commands.insertContentAt(editor.state.selection.head, {
          type: ReferenceNode.name,
          attrs: { id: reference.id },
        });
      },
    };
  }, [editor, editorRef]);

  if (!editor) {
    return <div>...</div>;
  }

  return (
    <div className="tiptap-editor">
      <MenuBar editor={editor} />
      <EditorContent className="px-2" editor={editor} />
    </div>
  );
}
