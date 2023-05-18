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
import AutoLinkPlugin from '../plugins/AutoLinkPlugin';
import CollapsiblePlugin, {
  CollapsibleNodes,
} from '../plugins/CollapsiblePlugin';
import { $createCollapsibleContainerNode } from '../plugins/CollapsiblePlugin/CollapsibleContainerNode';
import { $createCollapsibleContentNode } from '../plugins/CollapsiblePlugin/CollapsibleContentNode';
import { $createCollapsibleTitleNode } from '../plugins/CollapsiblePlugin/CollapsibleTitleNode';
import { TreeViewPlugin } from './../plugins/TreeViewPlugin';

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
    ...CollapsibleNodes,
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

      // console.log(root, selection);

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
      <div className="editor-container h-full">
        <ToolbarPlugin />
        <div className=" flex h-full flex-col">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="w-full flex-grow p-2 leading-relaxed focus:outline-none" />
            }
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          {visibleTreeView && <TreeViewPlugin />}

          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <CollapsiblePlugin />
          <AutoFocusPlugin />
          <AutoLinkPlugin />
          <OnChangePlugin
            onChange={(state, editor) => {
              handleOnChange(state, editor);
              onChange(editor);
            }}
          />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        </div>
      </div>
    </LexicalComposer>
  );
}

function prepopulatedRichText() {
  const root = $getRoot();
  if (root.getFirstChild() === null) {
    root.append(
      $createParagraphNode().append(
        $createTextNode('This editor is a demo environment built with '),
        $createTextNode('@lexical/react').toggleFormat('code'),
        $createTextNode('.'),
        $createTextNode(' Try typing in '),
        $createTextNode('some text').toggleFormat('bold'),
        $createTextNode(' with '),
        $createTextNode('different').toggleFormat('italic'),
        $createTextNode(' formats.'),
      ),
    );

    root.append($createParagraphNode());

    root.append(
      $createParagraphNode().append(
        $createTextNode(
          'Make sure to check out the various plugins in the toolbar. You can also use the collapsible item to create collapsing sections with a title and content!',
        ),
      ),
    );

    root.append(
      $createParagraphNode(),
      $createCollapsibleContainerNode(true).append(
        $createCollapsibleTitleNode().append($createTextNode('Title')),
        $createCollapsibleContentNode().append(
          $createParagraphNode().append(
            $createTextNode(
              "Quick: do you have a plan to become proactive. Our end-to-end feature set is unparalleled in the DXP space. If all of this comes off as mixed-up to you, that's because it is! Quick: do you have a infinitely reconfigurable scheme for coping with emerging methodologies? Is it more important for something to be dynamic or to be best-of-breed? The portals factor can be summed up in one word: affiliate-based. If all of this comes off as mixed-up to you, that's because it is! What does the term 'structuring'. Our end-to-end feature set is unparalleled, but our newbie-proof administration and simple configuration. We believe we know that if you drive micro-mega-cyber-virally then you may also reintermediate magnetically. It sounds wonderful, but it's 100 percent accurate! The experiences factor is short-term. If you incentivize dynamically, you may also mesh iteravely. Without development, you will lack social networks. Our feature set is unparalleled, but our sexy raw bandwidth and easy operation is invariably considered a remarkable achievement. Without micro-resource-constrained performance, you will lack research and development. Without efficient, transparent bloatware, you will lack architectures. We pride ourselves not only on our robust iteration and user-proof configuration is usually considered an amazing achievement.",
            ),
          ),
        ),
      ),
      $createParagraphNode(),
    );

    root.append(
      $createParagraphNode().append(
        $createTextNode(
          `If you'd like to find out more about Lexical, you can use https://lexical.dev/`,
        ),
      ),
    );
  }
}
