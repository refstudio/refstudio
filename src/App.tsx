import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { GreetingPanel } from './GreetingPanel';
import { useState } from 'react';
import { EditorPanel } from './EditorPanel';

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
      <EditorPanel onSelection={setSelection} />
      <ResizeHandle />
      <AIPanel selection={selection} />
      <Panel />
    </PanelGroup>
  );
}

function AIPanel({ selection }: { selection: string }) {
  return (
    <Panel defaultSize={20}>
      <h1>AI</h1>
      <div>{selection}</div>
    </Panel>
  );
}

function ReferencesPanel() {
  return (
    <Panel defaultSize={20}>
      <h1>References</h1>
      <ul>
        <li>Ref 1</li>
        <li>Ref 2</li>
        <li>Ref 3</li>
        <li>Ref 4</li>
      </ul>
    </Panel>
  );
}

function ResizeHandle() {
  return (
    <PanelResizeHandle
      style={{
        backgroundColor: '#EFEFEF',
        marginLeft: 10,
        marginRight: 10,
        display: 'flex',
        alignItems: 'center',
        width: 10,
      }}
    ></PanelResizeHandle>
  );
}
export default App;
