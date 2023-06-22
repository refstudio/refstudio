import './TipTapEditor.css';

import { Editor, EditorContent } from '@tiptap/react';
import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';

import { selectionAtom } from '../atoms/selectionState';
import { MenuBar } from './MenuBar';
import { EDITOR_EXTENSIONS, INITIAL_CONTENT, transformPasted } from './TipTapEditorConfigs';

interface EditorProps {
  editorContent: string | null;
}

export function TipTapEditor({ editorContent }: EditorProps) {
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
        console.log('selection range', from, to, text);
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
