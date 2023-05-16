import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { GreetingPanel } from './GreetingPanel';
import { useState } from 'react';
import { EditorPanel } from './EditorPanel';
import RichTextEditorPanel from './RichTextEditorPanel';
import { ReferencesPanel } from './ReferencesPanel';

function App() {
  const [selection, setSelection] = useState('');
  return (
    <PanelGroup
      autoSaveId="ref-studio"
      direction="horizontal"
      style={{ height: '100vh' }}
    >
      <ReferencesPanel />
      <ResizeHandle />

      {/* <EditorPanel onSelection={setSelection} /> */}
      <RichTextEditorPanel onSelection={setSelection} />

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
