import { FileEntry } from '@tauri-apps/api/fs';
import * as React from 'react';
import { useCallback } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useDebounce } from 'usehooks-ts';

import { EditorAPI } from './types/EditorAPI';
import { ReferenceItem } from './types/ReferenceItem';
import { AIView } from './views/AIView';
import { CenterPaneView } from './views/CenterPaneView';
import { FoldersView } from './views/FoldersView';
import { ReferencesView } from './views/ReferencesView';

function App() {
  const [selectedFile, setSelectedFile] = React.useState<FileEntry | undefined>();

  const [selection, setSelection] = React.useState<string | null>(null);
  const debouncedSelection = useDebounce(selection, 200);
  const editorRef = React.useRef<EditorAPI>();
  const handleReferenceClicked = (reference: ReferenceItem) => {
    editorRef.current?.insertReference(reference);
  };

  const handleFolderClick = useCallback((file: FileEntry) => {
    setSelectedFile(file);
  }, []);

  return (
    <PanelGroup autoSaveId="refstudio" direction="horizontal">
      <Panel className="p-4" collapsible defaultSize={20}>
        <FoldersView onClick={handleFolderClick} />
      </Panel>
      <VerticalResizeHandle />

      <Panel defaultSize={60}>
        <CenterPaneView editorRef={editorRef} file={selectedFile} onSelectionChange={setSelection} />
      </Panel>

      <VerticalResizeHandle />
      <Panel>
        <PanelGroup autoSaveId="rs-right-sidebar" direction="vertical">
          <Panel className="p-3">
            <ReferencesView onRefClicked={handleReferenceClicked} />
          </Panel>
          <HorizontalResizeHandle />
          <Panel className="p-3">
            <AIView selection={debouncedSelection} />
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
