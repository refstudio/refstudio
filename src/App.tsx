import * as React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import { EditorAPI } from './types/EditorAPI';
import { ReferenceItem } from './types/ReferenceItem';
import { AIView } from './views/AIView';
import { CenterPaneView } from './views/CenterPaneView';
import { FoldersView } from './views/FoldersView';
import { OpenedFilesView } from './views/OpenedFilesView';
import { ReferencesView } from './views/ReferencesView';

function App() {
  const editorRef = React.useRef<EditorAPI>();
  const handleReferenceClicked = (reference: ReferenceItem) => {
    editorRef.current?.insertReference(reference);
  };

  return (
    <PanelGroup autoSaveId="refstudio" direction="horizontal">
      <Panel defaultSize={20} collapsible className="overflow-scroll p-4">
        <FoldersView />
      </Panel>
      <VerticalResizeHandle />
      <Panel defaultSize={60} className="overflow-scroll px-3">
        <OpenedFilesView />
        <CenterPaneView editorRef={editorRef} />
      </Panel>
      <VerticalResizeHandle />
      <Panel>
        <PanelGroup autoSaveId="rs-right-sidebar" direction="vertical">
          <Panel className="overflow-scroll p-3">
            <ReferencesView onRefClicked={handleReferenceClicked} />
          </Panel>
          <HorizontalResizeHandle />
          <Panel className="overflow-scroll p-3">
            <AIView />
          </Panel>
        </PanelGroup>
      </Panel>
    </PanelGroup>
  );
}

function VerticalResizeHandle() {
  return <PanelResizeHandle className="flex w-1 items-center bg-gray-200 hover:bg-blue-100" />;
}

function HorizontalResizeHandle() {
  return <PanelResizeHandle className="flex h-1 items-center bg-gray-200 hover:bg-blue-100" />;
}

export default App;
