import React, { useCallback, useState } from 'react';
import { VscChevronUp } from 'react-icons/vsc';
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
  const editorRef = React.useRef<EditorAPI>(null);

  const pdfViewerRef = React.useRef<PdfViewerAPI>(null);
  const updatePDFViewerWidth = useCallback(() => {
    pdfViewerRef.current?.updateWidth();
  }, [pdfViewerRef]);

  return (
    <PanelGroup
      autoSaveId="refstudio"
      className="relative h-full"
      direction="horizontal"
      onLayout={updatePDFViewerWidth}
    >
      <LeftSidePanelWrapper onRefClicked={(reference) => editorRef.current?.insertReference(reference)} />
      <Panel defaultSize={60}>
        <MainPanel editorRef={editorRef} pdfViewerRef={pdfViewerRef} />
      </Panel>
      <RightPanelWrapper />
    </PanelGroup>
  );
}

function LeftSidePanelWrapper({ onRefClicked }: { onRefClicked(item: ReferenceItem): void }) {
  const leftPanelRef = React.useRef<ImperativePanelHandle>(null);
  const [primaryPaneCollapsed, setPrimaryPaneCollapsed] = useState(false);
  const [primaryPane, setPrimaryPane] = useState<PrimarySideBarPane>('Explorer');

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

  return (
    <>
      <PrimarySideBar activePane={primaryPaneCollapsed ? null : primaryPane} onClick={handleSideBarClick} />
      <Panel
        collapsible
        defaultSize={20}
        ref={leftPanelRef}
        onCollapse={(collapsed) => setPrimaryPaneCollapsed(collapsed)}
      >
        {primaryPane === 'Explorer' && <ExplorerPanel />}
        {primaryPane === 'References' && <ReferencesPanel onRefClicked={onRefClicked} />}
      </Panel>
      <VerticalResizeHandle />
    </>
  );
}

function RightPanelWrapper() {
  const [closed, setClosed] = React.useState(false);

  if (closed) {
    return (
      <div className="absolute bottom-0 right-0 flex border border-slate-300 bg-slate-100 px-4 py-2">
        <div className="flex w-60 items-center justify-between">
          <div>AI</div>
          <div>
            <VscChevronUp onClick={() => setClosed(false)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <VerticalResizeHandle />
      <Panel>
        <AIPanel onCloseClick={() => setClosed(true)} />
      </Panel>
    </>
  );
}

export default App;
