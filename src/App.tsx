import * as React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ReferenceItem } from './types/ReferenceItem';
import { AIView } from './views/AIView';
import { EditorView } from './views/EditorView';
import { FoldersView } from './views/FoldersView';
import { ReferencesView } from './views/ReferencesView';

import { useDebounce } from 'usehooks-ts';
import { EditorAPI } from './types/EditorAPI';

function App() {
  const [selection, setSelection] = React.useState<string | null>(null);
  const debouncedSelection = useDebounce(selection, 200);

  const [editor, setEditor] = React.useState<'TipTap' | 'Lexical'>('TipTap');

  const editorRef = React.useRef<EditorAPI>();

  const handleReferenceClicked = (reference: ReferenceItem) => {
    editorRef.current?.insertReference(reference);
  };

  return (
    <PanelGroup autoSaveId="refstudio" direction="horizontal">
      <Panel defaultSize={20} collapsible className="overflow-scroll p-4">
        <FoldersView
          onClick={() => setEditor(editor === 'TipTap' ? 'Lexical' : 'TipTap')}
        />
      </Panel>
      <VerticalResizeHandle />

      <Panel defaultSize={60} className="overflow-scroll p-3">
        <EditorView
          editor={editor}
          onSelectionChange={setSelection}
          editorRef={editorRef}
        />
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
