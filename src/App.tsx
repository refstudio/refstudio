import { $getSelection, LexicalEditor } from 'lexical';
import { useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { AIView } from './AIView';
import EditorView from './EditorView';
import { FoldersView } from './FoldersView';
import { ReferencesView } from './ReferencesView';

function App() {
  const [selection, setSelection] = useState('');

  const editorRef = useRef({
    main: null as LexicalEditor | null,
  });

  function handleRefClicked(reference: string) {
    console.log('REF CLICKED', reference);
    if (!editorRef.current.main) return;
    editorRef.current.main.update(() => {
      $getSelection()?.insertText(`[${reference}]`);

      // const editor = editorRef.current.main;
      // const state = editor?.getEditorState();
      // const selection = state?._selection;
      // if (selection) selection.insertText(`[${reference}`);
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
            <AIView selection={selection} />
          </Panel>
          <HorizontalResizeHandle />
          <Panel style={{ padding: 10 }}>
            <ReferencesView onRefClicked={handleRefClicked} />
          </Panel>
        </PanelGroup>
      </Panel>
    </PanelGroup>
  );
}

function VerticalResizeHandle() {
  return (
    <PanelResizeHandle
      style={{
        backgroundColor: '#EFEFEF',

        display: 'flex',
        alignItems: 'center',
        width: 10,
      }}
    ></PanelResizeHandle>
  );
}

function HorizontalResizeHandle() {
  return (
    <PanelResizeHandle
      style={{
        backgroundColor: '#EFEFEF',

        display: 'flex',
        alignItems: 'center',
        height: 10,
      }}
    ></PanelResizeHandle>
  );
}
export default App;
