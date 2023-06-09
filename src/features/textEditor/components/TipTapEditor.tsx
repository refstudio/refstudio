import './TipTapEditor.css';

import { Editor, EditorContent, JSONContent } from '@tiptap/react';
import { useSetAtom } from 'jotai';
import { useCallback, useEffect, useState } from 'react';

import { selectionAtom } from '../../../atoms/selectionState';
import { EditorContent as EditorContentType } from '../../../atoms/types/EditorContent';
import { Spinner } from '../../../components/Spinner';
import { useListenEvent } from '../../../hooks/useListenEvent';
import { MenuBar } from './MenuBar';
import { EDITOR_EXTENSIONS, transformPasted } from './tipTapEditorConfigs';

interface EditorProps {
  editorContent: string | JSONContent | null;
  isActive: boolean;
  saveFileInMemory: () => void;
  updateFileBuffer: (editorContent: EditorContentType) => void;
}

export function TipTapEditor({ editorContent, isActive, saveFileInMemory, updateFileBuffer }: EditorProps) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const setSelection = useSetAtom(selectionAtom);

  useEffect(() => {
    const newEditor = new Editor({
      extensions: EDITOR_EXTENSIONS,
      content: editorContent ?? '',
      onSelectionUpdate: (update) => {
        const updatedEditor = update.editor;
        const { from, to } = updatedEditor.view.state.selection;
        const text = updatedEditor.view.state.doc.textBetween(from, to);
        setSelection(text);
      },
      editorProps: {
        transformPasted,
      },
      onUpdate: ({ editor: updatedEditor }) => {
        updateFileBuffer({ type: 'text', textContent: updatedEditor.storage.markdown.getMarkdown() as string });
      },
    });
    setEditor(newEditor);
    return () => {
      saveFileInMemory();
      newEditor.destroy();
    };
  }, [editorContent, setSelection, saveFileInMemory, updateFileBuffer]);

  const insertContent = useCallback(
    ({ text }: { text: string }) => {
      if (isActive) {
        editor?.commands.insertContent(text);
      }
    },
    [editor, isActive],
  );

  useListenEvent('refstudio://ai/suggestion/insert', insertContent);

  if (!editor) {
    return <Spinner />;
  }

  return (
    <div className="flex h-full w-full flex-col">
      <MenuBar editor={editor} />
      <EditorContent className="tiptap-editor" editor={editor} />
    </div>
  );
}
