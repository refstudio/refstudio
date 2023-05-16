import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { GreetingPanel } from './GreetingPanel';
import { useRef, useState } from 'react';
import { EditorPanel } from './EditorPanel';
import RichTextEditorPanel from './RichTextEditorPanel';
import { ReferencesPanel } from './ReferencesPanel';
import { $createParagraphNode, $getSelection, LexicalEditor } from 'lexical';

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
      <ReferencesPanel onRefClicked={handleRefClicked} />
      <ResizeHandle />

      {/* <EditorPanel onSelection={setSelection} /> */}
      <RichTextEditorPanel
        onChange={(editor) => (editorRef.current.main = editor)}
        onSelection={setSelection}
      />

      <ResizeHandle />
      <AIPanel selection={selection} />
    </PanelGroup>
  );
}

function AIPanel({ selection }: { selection: string }) {
  return (
    <Panel defaultSize={20} style={{ padding: 10 }}>
      <h1>AI</h1>
      <div>{selection}</div>
    </Panel>
  );
}

function ResizeHandle() {
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
export default App;
