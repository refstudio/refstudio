import React, { useCallback, useState } from 'react';
import { ImperativePanelHandle, Panel, PanelGroup } from 'react-resizable-panels';

import { PrimarySideBar, PrimarySideBarPane } from './components/PrimarySideBar';
import { VerticalResizeHandle } from './components/VerticalResizeHandle';
import { AIPanel } from './panels/AIPanel';
import { ExplorerPanel } from './panels/ExplorerPanel';
import { MainPanel } from './panels/MainPanel';
import { ReferencesPanel } from './panels/ReferencesPanel';
import { EditorAPI } from './types/EditorAPI';
import { PdfViewerAPI } from './types/PdfViewerAPI';
import { ReferenceItem } from './types/ReferenceItem';

function App() {
  const [primaryPaneCollapsed, setPrimaryPaneCollapsed] = useState(false);
  const [primaryPane, setPrimaryPane] = useState<PrimarySideBarPane>('Explorer');

  const leftPanelRef = React.useRef<ImperativePanelHandle>(null);
  const editorRef = React.useRef<EditorAPI>(null);
  const pdfViewerRef = React.useRef<PdfViewerAPI>(null);
  const handleReferenceClicked = (reference: ReferenceItem) => {
    editorRef.current?.insertReference(reference);
  };

  function handleSideBarClick(selectedPane: PrimarySideBarPane) {
    if (selectedPane === primaryPane) {
      // Toggle collapsing
      setPrimaryPaneCollapsed(!primaryPaneCollapsed);
    } else {
      // Always open the sidebar
      setPrimaryPaneCollapsed(false);
    }
    setPrimaryPane(selectedPane);
  }

  React.useEffect(() => {
    if (primaryPaneCollapsed) {
      leftPanelRef.current?.collapse();
    } else {
      leftPanelRef.current?.expand();
    }
  }, [leftPanelRef, primaryPaneCollapsed]);

  const updatePDFViewerWidth = useCallback(() => {
    pdfViewerRef.current?.updateWidth();
  }, [pdfViewerRef]);

  return (
    <PanelGroup autoSaveId="refstudio" className="h-full" direction="horizontal" onLayout={updatePDFViewerWidth}>
      <PrimarySideBar activePane={primaryPaneCollapsed ? null : primaryPane} onClick={handleSideBarClick} />
      <Panel
        collapsible
        defaultSize={20}
        ref={leftPanelRef}
        onCollapse={(collapsed) => setPrimaryPaneCollapsed(collapsed)}
      >
        {primaryPane === 'Explorer' && <ExplorerPanel />}
        {primaryPane === 'References' && <ReferencesPanel onRefClicked={handleReferenceClicked} />}
      </Panel>
      <VerticalResizeHandle />

      <Panel defaultSize={60}>
        <MainPanel editorRef={editorRef} pdfViewerRef={pdfViewerRef} />
      </Panel>

      <VerticalResizeHandle />
      <Panel collapsible>
        <AIPanel />
      </Panel>
    </PanelGroup>
  );
}

export default App;
