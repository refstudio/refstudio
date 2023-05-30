import React, { useCallback, useReducer, useState } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { useDebounce } from 'usehooks-ts';

import { PrimarySideBar, PrimarySideBarPane } from './components/PrimarySideBar';
import { VerticalResizeHandle } from './components/VerticalResizeHandle';
import { defaultFilesState, filesReducer } from './filesReducer';
import { AIPanel } from './panels/AIPanel';
import { CenterPanel } from './panels/CenterPanel';
import { ExplorerPanel } from './panels/ExplorerPanel';
import { ReferencesPanel } from './panels/ReferencesPanel';
import { EditorAPI } from './types/EditorAPI';
import { PdfViewerAPI } from './types/PdfViewerAPI';
import { ReferenceItem } from './types/ReferenceItem';

function App() {
  const [files, dispatch] = useReducer(filesReducer, defaultFilesState());

  const [primaryPane, setPrimaryPane] = useState<PrimarySideBarPane>('Explorer');

  const [selection, setSelection] = React.useState<string | null>(null);
  const debouncedSelection = useDebounce(selection, 200);
  const editorRef = React.useRef<EditorAPI>(null);
  const pdfViewerRef = React.useRef<PdfViewerAPI>(null);
  const handleReferenceClicked = (reference: ReferenceItem) => {
    editorRef.current?.insertReference(reference);
  };

  const updatePDFViewerWidth = useCallback(() => {
    pdfViewerRef.current?.updateWidth();
  }, [pdfViewerRef]);

  return (
    <PanelGroup autoSaveId="refstudio" className="h-full" direction="horizontal" onLayout={updatePDFViewerWidth}>
      <PrimarySideBar activePane={primaryPane} onClick={setPrimaryPane} />
      <Panel collapsible defaultSize={20}>
        {primaryPane === 'Explorer' && <ExplorerPanel files={files} filesDispatch={dispatch} />}
        {primaryPane === 'References' && <ReferencesPanel onRefClicked={handleReferenceClicked} />}
      </Panel>
      <VerticalResizeHandle />

      <Panel defaultSize={60}>
        <CenterPanel
          editorRef={editorRef}
          files={files}
          filesDispatch={dispatch}
          pdfViewerRef={pdfViewerRef}
          onSelectionChange={setSelection}
        />
      </Panel>

      <VerticalResizeHandle />
      <Panel collapsible>
        <AIPanel selection={debouncedSelection} />
      </Panel>
    </PanelGroup>
  );
}

export default App;
