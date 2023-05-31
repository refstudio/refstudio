import './TipTapEditor.css';

import { Editor, EditorContent } from '@tiptap/react';
import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';

import { selectionAtom } from '../atoms/selectionState';
import { EditorProps } from '../types/EditorProps';
import { MenuBar } from './MenuBar';
import { ReferenceNode } from './ReferenceBlock/ReferenceNode';
import { EDITOR_EXTENSIONS, INITIAL_CONTENT } from './TipTapEditorConfigs';

export function TipTapEditor({ editorRef, editorContent }: EditorProps) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const setSelection = useSetAtom(selectionAtom);

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
    <div className="tiptap-editor flex h-full flex-col">
      <MenuBar editor={editor} />
      <EditorContent className="flex-1 overflow-scroll pl-5 pr-2 pt-4" editor={editor} />
    </div>
  );
}
