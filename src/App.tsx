import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Color from '@tiptap/extension-color';
import ListItem from '@tiptap/extension-list-item';
import TextStyle from '@tiptap/extension-text-style';
import { Extensions, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import * as React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Markdown } from 'tiptap-markdown';
import { CollapsibleBlockContentNode } from './CollapsibleBlock/nodes/CollapsibleBlockContent';
import { CollapsibleBlockNode } from './CollapsibleBlock/nodes/CollapsibleBlockNode';
import { CollapsibleBlockSummaryNode } from './CollapsibleBlock/nodes/CollapsibleBlockSummary';
import { ReferenceNode } from './Reference/ReferenceNode';
import { ReferenceItem } from './types/ReferenceItem';
import { AIView } from './views/AIView';
import EditorView from './views/EditorView';
import { FoldersView } from './views/FoldersView';
import { ReferencesView } from './views/ReferencesView';

import markdown from 'highlight.js/lib/languages/markdown';
import { lowlight } from 'lowlight';
import { useDebounce } from 'usehooks-ts';
lowlight.registerLanguage('markdown', markdown);

const EDITOR_EXTENSIONS: Extensions = [
  // Custom extensions
  CollapsibleBlockNode,
  CollapsibleBlockContentNode,
  CollapsibleBlockSummaryNode,
  ReferenceNode,

  Markdown,
  CodeBlockLowlight.configure({
    lowlight,
  }),
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle,
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
  }),
];

const INITIAL_CONTENT = `
<h2>
  Hi there,
</h2>
<collapsible-block folded="false"><em>Collapsible 1</em><collapsible-block>collapsible 1.1</collapsible-block>Text<collapsible-block>collapsible 1.2</collapsible-block></collapsible-block>
<collapsible-block>Collapsible 2<collapsible-block>collapsible 2.1</collapsible-block></collapsible-block>
<p>
this is a <em>basic</em> example of <strong>tiptap</strong>. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:
</p>
<ul>
<li>
That’s a bullet list with one …
<span data-type="mention" data-id="ref1" class="mention"></span>
</li>
  <li>
    … or two list items.
  </li>
</ul>
<p>
  Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:
</p>
<pre><code class="language-css">body {
display: none;
}</code></pre>
<p>
  I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.
</p>
<blockquote>
  Wow, that’s amazing. Good work, boy! 👏
  <br />
  — Mom
</blockquote>
`;

function App() {
  const [selection, setSelection] = React.useState<string | null>(null);
  const debouncedSelection = useDebounce(selection, 200);

  const editor = useEditor({
    extensions: EDITOR_EXTENSIONS,
    content: INITIAL_CONTENT,
    onSelectionUpdate({ editor }) {
      const { from, to } = editor.view.state.selection;
      setSelection(editor.view.state.doc.textBetween(from, to));
    },
  });

  const handleReferenceClicked = (reference: ReferenceItem) => {
    editor?.commands.insertContentAt(editor.state.selection.head, {
      type: ReferenceNode.name,
      attrs: { id: reference.id },
    });
  };

  return (
    <PanelGroup autoSaveId="refstudio" direction="horizontal">
      <Panel defaultSize={20} collapsible className="overflow-scroll p-4">
        <FoldersView />
      </Panel>
      <VerticalResizeHandle />

      <Panel defaultSize={60} className="overflow-scroll p-3">
        {editor && <EditorView editor={editor} />}
      </Panel>

      <VerticalResizeHandle />
      <Panel>
        <PanelGroup autoSaveId="rs-right-sidebar" direction="vertical">
          <Panel className="overflow-scroll p-3">
            <ReferencesView onRefClicked={handleReferenceClicked} />
          </Panel>
          <HorizontalResizeHandle />
          <Panel className="overflow-scroll p-3">
            <AIView selection={debouncedSelection} />
          </Panel>
        </PanelGroup>
      </Panel>
    </PanelGroup>
  );
}

function VerticalResizeHandle() {
  return (
    <PanelResizeHandle className="flex w-1 items-center bg-gray-200 hover:bg-blue-100" />
  );
}

function HorizontalResizeHandle() {
  return (
    <PanelResizeHandle className="flex h-1 items-center bg-gray-200 hover:bg-blue-100" />
  );
}

export default App;
