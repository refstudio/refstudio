import { $getSelection, LexicalEditor } from 'lexical';
import { useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { $createReferenceNode } from './lexical-nodes/ReferenceNode';
import { ReferenceItem } from './types/ReferenceItem';
import { AIView } from './views/AIView';
import EditorView from './views/EditorView';
import { FoldersView } from './views/FoldersView';
import { ReferencesView } from './views/ReferencesView';

function App() {
  const [selection, setSelection] = useState('');

  const editorRef = useRef({
    main: null as LexicalEditor | null,
  });

  function handleRefClicked(reference: ReferenceItem) {
    if (!editorRef.current.main) return;
    editorRef.current.main.update(() => {
      $getSelection()?.insertNodes([
        $createReferenceNode(reference),
        // .setFormat('bold'),
        // $createTextNode(`[${referenceId}]`).setFormat('bold'),
      ]);
    });
  }

  return (
    <PanelGroup
      autoSaveId="ref-studio"
      direction="horizontal"
      style={{ height: '100vh' }}
    >
      <Panel defaultSize={20} style={{ padding: 10 }}>
        <FoldersView />
      </Panel>
      <VerticalResizeHandle />

      <Panel defaultSize={60} style={{ padding: 10 }}>
        <EditorView
          onChange={(editor) => (editorRef.current.main = editor)}
          onSelection={setSelection}
        />
      </Panel>

      <VerticalResizeHandle />
      <Panel>
        <PanelGroup direction="vertical">
          <Panel style={{ padding: 10 }}>
            <ReferencesView onRefClicked={handleRefClicked} />
          </Panel>
          <HorizontalResizeHandle />
          <Panel style={{ padding: 10 }}>
            <AIView selection={selection} />
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
