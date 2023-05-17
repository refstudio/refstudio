import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import {
  InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';

import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { TRANSFORMERS } from '@lexical/markdown';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  EditorState,
  LexicalEditor,
  ParagraphNode,
} from 'lexical';
import { ToolbarPlugin } from './../plugins/TollbarPlugin';

import { useState } from 'react';
import useDebounce from '../hooks/useDebounce';
import { ReferenceNode } from '../lexical-nodes/ReferenceNode';
import { TreeViewPlugin } from './../plugins/TreeViewPlugin';
import './EditorView.css';

function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

const editorConfig: InitialConfigType = {
  namespace: 'RefStudio',
  onError(error: Error) {
    throw error;
  },
  // Any custom nodes go here
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    ParagraphNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
    ReferenceNode,
  ],
  editorState: prepopulatedRichText,
};

export default function EditorView({
  onChange,
  onSelection,
}: {
  onChange: (editor: LexicalEditor) => any;
  onSelection: (selection: string) => any;
}) {
  const [visibleTreeView, setVisibleTreeView] = useState(false);
  const debouncedHandleSelection = useDebounce(onSelection, 200);

  // When the editor changes, you can get notified via the
  // LexicalOnChangePlugin!
  function handleOnChange(editorState: EditorState, editor: LexicalEditor) {
    editorState.read(() => {
      // Read the contents of the EditorState here.
      const root = $getRoot();
      const selection = $getSelection();

      console.log(root, selection);

      const selectedText = selection?.getTextContent();
      selectedText && debouncedHandleSelection(selectedText);
    });
  }

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <h1 className="flex justify-between">
        Editor
        <span className="flex gap-2 text-sm">
          <button
            className="rounded-md border bg-gray-400 px-1 py-0 text-white hover:bg-gray-500"
            onClick={() => setVisibleTreeView(!visibleTreeView)}
          >
            Lexical Tree
          </button>
        </span>
      </h1>
      <div className="editor-container">
        <ToolbarPlugin />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <AutoFocusPlugin />
          <OnChangePlugin
            onChange={(state, editor) => {
              handleOnChange(state, editor);
              onChange(editor);
            }}
          />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        </div>
        {visibleTreeView && <TreeViewPlugin />}
      </div>
    </LexicalComposer>
  );
}

function prepopulatedRichText() {
  const root = $getRoot();
  if (root.getFirstChild() === null) {
    const paragraph = $createParagraphNode();
    paragraph.append(
      $createTextNode('The playground is a demo environment built with '),
      $createTextNode('@lexical/react').toggleFormat('code'),
      $createTextNode('.'),
      $createTextNode(' Try typing in '),
      $createTextNode('some text').toggleFormat('bold'),
      $createTextNode(' with '),
      $createTextNode('different').toggleFormat('italic'),
      $createTextNode(' formats.'),
    );
    root.append(paragraph);
    const paragraph2 = $createParagraphNode();
    paragraph2.append(
      $createTextNode(
        'Make sure to check out the various plugins in the toolbar. You can also use #hashtags or @-mentions too!',
      ),
    );
    root.append(paragraph2);
    const paragraph3 = $createParagraphNode();
    paragraph3.append(
      $createTextNode(`If you'd like to find out more about Lexical, you can:`),
    );
    root.append(paragraph3);

    const paragraph4 = $createParagraphNode();
    paragraph4.append(
      $createTextNode(
        `Lastly, we're constantly adding cool new features to this playground. So make sure you check back here when you next get a chance :).`,
      ),
    );
    root.append(paragraph4);
  }
}
