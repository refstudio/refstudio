import './TipTapEditor.css';

import { Editor, EditorContent } from '@tiptap/react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useDebounce } from 'usehooks-ts';

import { setTextSelection } from '../features/selection/selectionSlice';
import { EditorProps } from '../types/EditorProps';
import { MenuBar } from './MenuBar';
import { ReferenceNode } from './ReferenceBlock/ReferenceNode';
import { EDITOR_EXTENSIONS, INITIAL_CONTENT } from './TipTapEditorConfigs';

export function TipTapEditor({ editorRef, editorContent }: EditorProps) {
  const [selection, setSelection] = useState('');

  const [editor, setEditor] = useState<Editor | null>(null);
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
  }, [editorContent]);

  // Dispatch (debounced) selection changed
  const dispatch = useDispatch();
  const debouncedSelection = useDebounce(selection, 200);
  useEffect(() => {
    dispatch(setTextSelection(debouncedSelection));
  }, [dispatch, debouncedSelection]);

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
