import './TipTapEditor.css';

import { Editor, EditorContent } from '@tiptap/react';
import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';

import { selectionAtom } from '../atoms/selectionState';
import { EditorAPI } from '../types/EditorAPI';
import { MenuBar } from './MenuBar';
import { ReferenceNode } from './ReferenceNode/ReferenceNode';
import { getReferenceLabel } from './ReferenceNode/ReferencesList';
import { EDITOR_EXTENSIONS, INITIAL_CONTENT, transformPasted } from './TipTapEditorConfigs';

interface EditorProps {
  editorRef: React.MutableRefObject<EditorAPI | null>;
  editorContent: string | null;
}

export function TipTapEditor({ editorRef, editorContent }: EditorProps) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const setSelection = useSetAtom(selectionAtom);

  useEffect(() => {
    const newEditor = new Editor({
      extensions: EDITOR_EXTENSIONS,
      content: editorContent ?? INITIAL_CONTENT,
      onSelectionUpdate(update) {
        const updatedEditor = update.editor;
        const { from, to } = updatedEditor.view.state.selection;
        const text = updatedEditor.view.state.doc.textBetween(from, to);
        setSelection(text);
      },
      editorProps: {
        transformPasted,
      },
    });
    setEditor(newEditor);
    return () => {
      newEditor.destroy();
    };
  }, [editorContent, setSelection]);

  useEffect(() => {
    if (!editor) {
      return;
    }
    editorRef.current = {
      insertReference(reference) {
        editor.commands.insertContentAt(editor.state.selection.head, {
          type: ReferenceNode.name,
          attrs: { id: reference.id, label: getReferenceLabel(reference) },
        });
      },
    };
  }, [editor, editorRef]);

  if (!editor) {
    return <div>...</div>;
  }

  return (
    <div className="flex h-full w-full flex-col">
      <MenuBar editor={editor} />
      <EditorContent className="tiptap-editor" editor={editor} />
    </div>
  );
}
