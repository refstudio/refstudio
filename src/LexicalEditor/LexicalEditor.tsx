import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import {
  InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';

import {
  $createCodeNode,
  $isCodeNode,
  CodeHighlightNode,
  CodeNode,
} from '@lexical/code';
import { $createLinkNode, AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { TRANSFORMERS } from '@lexical/markdown';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $createHeadingNode, HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  EditorState,
  ParagraphNode,
} from 'lexical';
import { ToolbarPlugin } from './plugins/TollbarPlugin';

import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from '@lexical/markdown';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createHorizontalRuleNode,
  HorizontalRuleNode,
} from '@lexical/react/LexicalHorizontalRuleNode';
import { useCallback, useEffect, useState } from 'react';

import { EditorProps } from '../types/EditorProps';
import { TreeViewPlugin } from '././plugins/TreeViewPlugin';
import {
  $createReferenceNode,
  ReferenceNode,
} from './lexical-nodes/ReferenceNode';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import CollapsiblePlugin, {
  CollapsibleNodes,
} from './plugins/CollapsiblePlugin';
import { $createCollapsibleContainerNode } from './plugins/CollapsiblePlugin/CollapsibleContainerNode';
import { $createCollapsibleContentNode } from './plugins/CollapsiblePlugin/CollapsibleContentNode';
import { $createCollapsibleTitleNode } from './plugins/CollapsiblePlugin/CollapsibleTitleNode';
import { PLAYGROUND_TRANSFORMERS } from './plugins/MarkdownTransformers';

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
    HorizontalRuleNode,
  ],
  editorState: prepopulatedRichText,
};

export default function LexicalEditor({
  editorRef,
  onSelectionChange,
}: EditorProps) {
  const [visibleTreeView, setVisibleTreeView] = useState(false);

  // When the editor changes, you can get notified via the
  // LexicalOnChangePlugin!
  function handleOnChange(editorState: EditorState) {
    editorState.read(() => {
      // Read the contents of the EditorState here.
      const selection = $getSelection();
      // const root = $getRoot();
      // console.log(root, selection);
      const selectedText = selection?.getTextContent();
      selectedText && onSelectionChange(selectedText);
    });
  }

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <h1 className="flex justify-between">
        Editor
        <span className="flex gap-2 text-sm">
          <ToggleMarkdownButton />
          <ActionsButton
            text="Lexical Tree"
            onClick={() => setVisibleTreeView(!visibleTreeView)}
          />
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
          <MarkdownShortcutPlugin />
          <OnChangePlugin onChange={handleOnChange} />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <EditorRefPlugin
            onSelectionChange={onSelectionChange}
            editorRef={editorRef}
          />
        </div>
      </div>
    </LexicalComposer>
  );
}

function EditorRefPlugin(props: EditorProps) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor) return;

    props.editorRef.current = {
      insertReference(reference) {
        editor.update(() => {
          $getSelection()?.insertNodes([
            $createReferenceNode(reference),
            // .setFormat('bold'),
            // $createTextNode(`[${referenceId}]`).setFormat('bold'),
          ]);
        });
      },
    };
  }, [editor]);
  return null;
}

function ToggleMarkdownButton() {
  const [editor] = useLexicalComposerContext();

  const handleMarkdownToggle = useCallback(() => {
    editor.update(() => {
      const root = $getRoot();
      const firstChild = root.getFirstChild();
      if ($isCodeNode(firstChild) && firstChild.getLanguage() === 'markdown') {
        $convertFromMarkdownString(
          firstChild.getTextContent(),
          PLAYGROUND_TRANSFORMERS,
        );
      } else {
        const markdown = $convertToMarkdownString(PLAYGROUND_TRANSFORMERS);
        root
          .clear()
          .append(
            $createCodeNode('markdown').append($createTextNode(markdown)),
          );
      }
      root.selectEnd();
    });
  }, [editor]);

  return <ActionsButton text="Markdown" onClick={handleMarkdownToggle} />;
}

function ActionsButton({
  text,
  onClick,
}: {
  text: string;
  onClick: () => any;
}) {
  return (
    <button
      className="rounded-md border bg-gray-400 px-1 py-0 text-white hover:bg-gray-500"
      onClick={onClick}
    >
      {text}
    </button>
  );
}

function prepopulatedRichText() {
  const root = $getRoot();
  if (root.getFirstChild() === null) {
    root.append($createHeadingNode('h1').append($createTextNode('Project X')));
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

    root.append(
      $createParagraphNode().append(
        $createTextNode(
          'Make sure to check out the various plugins in the toolbar. You can also use the collapsible item to create collapsing sections with a title and content!',
        ),
      ),
    );
    root.append($createHorizontalRuleNode());

    root.append(
      $createParagraphNode().append(
        $createTextNode(
          `If you'd like to find out more about Lexical, you can use https://lexical.dev/ and their `,
        ),
        $createLinkNode('https://playground.lexical.dev/').append(
          $createTextNode('playground'),
        ),
        $createTextNode(`.`),
      ),
    );

    root.append(
      $createHeadingNode('h2').append($createTextNode('Collapsible')),
    );

    root.append(
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
  }
}
