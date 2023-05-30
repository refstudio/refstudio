import React, { useReducer, useState } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { useDebounce } from 'usehooks-ts';

import { PanelWrapper } from './Components/PanelWrapper';
import { PrimarySideBar, PrimarySideBarPane } from './Components/PrimarySideBar';
import { VerticalResizeHandle } from './Components/VerticalResizeHandle';
import { defaultFilesState, filesReducer } from './filesReducer';
import { EditorAPI } from './types/EditorAPI';
import { ReferenceItem } from './types/ReferenceItem';
import { AIView } from './views/AIView';
import { CenterPaneView } from './views/CenterPaneView';
import { FoldersView } from './views/FoldersView';
import { ReferencesView } from './views/ReferencesView';

function App() {
  const [files, dispatch] = useReducer(filesReducer, defaultFilesState());

  const [primaryPane, setPrimaryPane] = useState<PrimarySideBarPane>('Explorer');

  const [selection, setSelection] = React.useState<string | null>(null);
  const debouncedSelection = useDebounce(selection, 200);
  const editorRef = React.useRef<EditorAPI>();
  const handleReferenceClicked = (reference: ReferenceItem) => {
    editorRef.current?.insertReference(reference);
  };

  return (
    <PanelGroup autoSaveId="refstudio" direction="horizontal">
      <PrimarySideBar activePane={primaryPane} onClick={setPrimaryPane} />
      <Panel collapsible defaultSize={20}>
        {primaryPane === 'Explorer' && (
          <PanelWrapper title="Explorer">
            <FoldersView files={files} filesDispatch={dispatch} />
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
        <CenterPaneView editorRef={editorRef} files={files} filesDispatch={dispatch} onSelectionChange={setSelection} />
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

export default App;
