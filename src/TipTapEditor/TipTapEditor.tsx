import './TipTapEditor.css';

import { BubbleMenu, Editor, EditorContent } from '@tiptap/react';
import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';

import { selectionAtom } from '../atoms/selectionState';
import { EditorAPI } from '../types/EditorAPI';
import { MenuBar } from './MenuBar';
import { ReferenceNode } from './ReferenceNode/ReferenceNode';
import { getReferenceLabel } from './ReferenceNode/ReferencesList';
import { EDITOR_EXTENSIONS, INITIAL_CONTENT } from './TipTapEditorConfigs';

interface EditorProps {
  editorRef: React.MutableRefObject<EditorAPI | null>;
  editorContent: string | null;
}

export function TipTapEditor({ editorRef, editorContent }: EditorProps) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const setSelection = useSetAtom(selectionAtom);

  useEffect(() => {
    setEditor(
      new Editor({
        extensions: EDITOR_EXTENSIONS,
        content: editorContent ?? INITIAL_CONTENT,
      }),
    );
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

  const handleSendSelectionToAi = () => {
    if (!editor) {
      return;
    }
    const { from, to } = editor.view.state.selection;
    const text = editor.view.state.doc.textBetween(from, to);
    setSelection(text);
  };

  if (!editor) {
    return <div>...</div>;
  }

  return (
    <div className="flex h-full w-full flex-col">
      <MenuBar editor={editor} />
      <BubbleMenu
        className="rounded-md bg-slate-200 p-1"
        editor={editor}
        tippyOptions={{ duration: 100, placement: 'top' }}
      >
        <button onClick={handleSendSelectionToAi}>Send to AI</button>
      </BubbleMenu>
      <EditorContent className="tiptap-editor flex-1 overflow-y-scroll pl-5 pr-2 pt-4" editor={editor} />
    </div>
  );
}
