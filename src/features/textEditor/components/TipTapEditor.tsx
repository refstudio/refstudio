import './TipTapEditor.css';

import { TextSelection } from '@tiptap/pm/state';
import { Editor, EditorContent, JSONContent } from '@tiptap/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useState } from 'react';

import { closeEditorFromAllPanesAtom } from '../../../atoms/editorActions';
import { openFilePathAtom } from '../../../atoms/fileEntryActions';
import { refreshFileTreeAtom } from '../../../atoms/fileExplorerActions';
import { getReferencesAtom } from '../../../atoms/referencesState';
import { selectionAtom } from '../../../atoms/selectionState';
import { EditorContent as EditorContentType } from '../../../atoms/types/EditorContent';
import { buildEditorIdFromPath, EditorId, parseEditorId } from '../../../atoms/types/EditorData';
import { Spinner } from '../../../components/Spinner';
import { emitEvent } from '../../../events';
import { useListenEvent } from '../../../hooks/useListenEvent';
import { saveAsMarkdown } from '../saveAsMarkdown';
import { MenuBar } from './MenuBar';
import { EDITOR_EXTENSIONS, transformPasted } from './tipTapEditorConfigs';
import { BlockSelection } from './tipTapNodes/notionBlock/selection/BlockSelection';
import { MarkdownSerializer } from './tipTapNodes/refStudioDocument/serialization/MarkdownSerializer';
import { sentenceCompletionCommand } from './tipTapNodes/sentenceCompletion/helpers/sentenceCompletionCommand';

interface EditorProps {
  editorContent: JSONContent;
  editorId: EditorId;
  isActive: boolean;
  saveFileInMemory: () => void;
  updateFileBuffer: (editorContent: EditorContentType) => void;
}

export function TipTapEditor({ editorContent, editorId, isActive, saveFileInMemory, updateFileBuffer }: EditorProps) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const setSelection = useSetAtom(selectionAtom);

  const references = useAtomValue(getReferencesAtom);
  const refreshFileTree = useSetAtom(refreshFileTreeAtom);

  const closeEditorFromAllPanes = useSetAtom(closeEditorFromAllPanesAtom);
  const openFilePath = useSetAtom(openFilePathAtom);

  useEffect(() => {
    const newEditor = new Editor({
      extensions: EDITOR_EXTENSIONS,
      content: editorContent,
      onSelectionUpdate: (update) => {
        const updatedEditor = update.editor;
        const { selection } = updatedEditor.view.state;

        const { content } = selection.content();

        const text = content.textBetween(0, content.size, '\n');
        setSelection(text);
      },
      editorProps: {
        transformPasted,
      },
      onUpdate: ({ editor: updatedEditor }) => {
        updateFileBuffer({ type: 'refstudio', jsonContent: updatedEditor.getJSON() });
      },
    });
    setEditor(newEditor);
    return () => {
      saveFileInMemory();
      newEditor.destroy();
    };
  }, [editorContent, setSelection, saveFileInMemory, updateFileBuffer]);

  useEffect(() => {
    if (isActive && editor) {
      if (!editor.isFocused) {
        // Note: We need this setTimeout to ensure the focus works.
        setTimeout(() => editor.commands.focus(), 100);
      }
    }
  }, [isActive, editor]);

  const insertContent = useCallback(
    ({ text }: { text: string }) => {
      if (isActive) {
        editor
          ?.chain()
          .command(({ tr, dispatch }) => {
            const { doc, selection } = tr;
            if (selection instanceof BlockSelection && dispatch) {
              tr.setSelection(TextSelection.between(doc.resolve(selection.from + 2), doc.resolve(selection.actualTo)));
              dispatch(tr);
            }
            return true;
          })
          .insertContent(text)
          .focus()
          .run();
      }
    },
    [editor, isActive],
  );

  const suggestSentenceCompletion = useCallback(() => {
    if (isActive) {
      editor?.chain().focus().command(sentenceCompletionCommand).run();
    }
  }, [editor, isActive]);

  const saveContentAsMarkdown = useCallback(() => {
    if (!isActive || !editor) {
      return;
    }
    emitEvent('refstudio://menu/file/save');

    const mdSerializer = new MarkdownSerializer(editor, references);
    const { id: filePath } = parseEditorId(editorId);

    void saveAsMarkdown(mdSerializer, filePath)
      .then((markdownFilePath) => {
        if (markdownFilePath) {
          closeEditorFromAllPanes(buildEditorIdFromPath(markdownFilePath));
          openFilePath(markdownFilePath);
        }
      })
      // We need to make sure the files were saved before refreshing the file tree.
      .then(refreshFileTree);
  }, [editor, editorId, isActive, references, refreshFileTree, closeEditorFromAllPanes, openFilePath]);

  useListenEvent('refstudio://ai/suggestion/suggest', suggestSentenceCompletion);
  useListenEvent('refstudio://ai/suggestion/insert', insertContent);
  useListenEvent('refstudio://menu/file/markdown', saveContentAsMarkdown);

  const focusEditorOnClick = useCallback(() => {
    editor?.commands.focus();
  }, [editor]);

  if (!editor) {
    return <Spinner />;
  }

  return (
    <div className="editor-container" onClick={focusEditorOnClick}>
      <MenuBar editor={editor} />
      <EditorContent className="tiptap-editor" editor={editor} />
    </div>
  );
}
