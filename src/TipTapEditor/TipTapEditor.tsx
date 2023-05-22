import { EditorContent, useEditor } from '@tiptap/react';
import { useEffect } from 'react';
import { EditorProps } from '../types/EditorProps';
import { MenuBar } from './MenuBar';
import { ReferenceNode } from './ReferenceBlock/ReferenceNode';
import './TipTapEditor.css';
import { EDITOR_EXTENSIONS, INITIAL_CONTENT } from './TipTapEditorConfigs';

export function TipTapEditor({ editorRef, editorContent, onSelectionChange }: EditorProps) {
  const editor = useEditor({
    extensions: EDITOR_EXTENSIONS,
    content: editorContent || INITIAL_CONTENT,
    onSelectionUpdate({ editor }) {
      const { from, to } = editor.view.state.selection;
      onSelectionChange(editor.view.state.doc.textBetween(from, to));
    },
  }, [editorContent, onSelectionChange]);

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
  }, [editor]);

  if (!editor) return <div>...</div>;

  return (
    <div className="tiptap-editor">
      <MenuBar editor={editor} />
      <EditorContent className="px-2" editor={editor} />
    </div>
  );
}
