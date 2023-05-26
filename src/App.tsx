import { FileEntry } from '@tauri-apps/api/fs';
import React, { useCallback, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useDebounce } from 'usehooks-ts';

import { PanelWrapper } from './Components/PanelWrapper';
import { PrimarySideBar, PrimarySideBarPane } from './Components/PrimarySideBar';
import { EditorAPI } from './types/EditorAPI';
import { ReferenceItem } from './types/ReferenceItem';
import { AIView } from './views/AIView';
import { CenterPaneView } from './views/CenterPaneView';
import { FoldersView } from './views/FoldersView';
import { ReferencesView } from './views/ReferencesView';

function App() {
  const [primaryPane, setPrimaryPane] = useState<PrimarySideBarPane>('Explorer');

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
      <PrimarySideBar activePane={primaryPane} onClick={setPrimaryPane} />
      <Panel defaultSize={20} collapsible>
        {primaryPane === 'Explorer' && (
          <PanelWrapper title="Explorer">
            <FoldersView onClick={handleFolderClick} />
          </PanelWrapper>
        )}
        {primaryPane === 'References' && (
          <PanelWrapper title="References">
            <ReferencesView onRefClicked={handleReferenceClicked} />
          </PanelWrapper>
        )}
      </Panel>
      <VerticalResizeHandle />

      <Panel defaultSize={60}>
        <CenterPaneView onSelectionChange={setSelection} editorRef={editorRef} file={selectedFile} />
      </Panel>

      <VerticalResizeHandle />
      <Panel collapsible>
        <PanelWrapper title="AI">
          <AIView selection={debouncedSelection} />
        </PanelWrapper>
      </Panel>
    </PanelGroup>
  );
}

function VerticalResizeHandle() {
  return <PanelResizeHandle className="flex w-1 items-center bg-gray-200 hover:bg-blue-100" />;
}

export default App;
