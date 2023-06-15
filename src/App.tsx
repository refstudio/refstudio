import React, { useCallback, useEffect, useState } from 'react';
import { VscChevronUp } from 'react-icons/vsc';
import { ImperativePanelHandle, Panel, PanelGroup } from 'react-resizable-panels';

import { PrimarySideBar, PrimarySideBarPane } from './components/PrimarySideBar';
import { VerticalResizeHandle } from './components/VerticalResizeHandle';
import { AIPanel } from './panels/AIPanel';
import { ExplorerPanel } from './panels/ExplorerPanel';
import { MainPanel } from './panels/MainPanel';
import { ReferencesPanel } from './panels/ReferencesPanel';
import { SettingsModal } from './settings/SettingsModal';
import { EditorAPI } from './types/EditorAPI';
import { PdfViewerAPI } from './types/PdfViewerAPI';
import { ReferenceItem } from './types/ReferenceItem';

function App() {
  const editorRef = React.useRef<EditorAPI>(null);

  const pdfViewerRef = React.useRef<PdfViewerAPI>(null);
  const updatePDFViewerWidth = useCallback(() => {
    pdfViewerRef.current?.updateWidth();
  }, [pdfViewerRef]);

  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <PanelGroup
        autoSaveId="refstudio"
        className="relative h-full"
        direction="horizontal"
        onLayout={updatePDFViewerWidth}
      >
        <LeftSidePanelWrapper
          onRefClicked={(reference) => editorRef.current?.insertReference(reference)}
          onSettingsClick={() => setSettingsOpen(true)}
        />
        <Panel defaultSize={60}>
          <MainPanel editorRef={editorRef} pdfViewerRef={pdfViewerRef} />
        </Panel>
        <RightPanelWrapper />
      </PanelGroup>
      <SettingsModal open={settingsOpen} onToggle={(open) => setSettingsOpen(open)} />
    </>
  );
}

function LeftSidePanelWrapper({
  onRefClicked,
  onSettingsClick,
}: {
  onRefClicked(item: ReferenceItem): void;
  onSettingsClick(): void;
}) {
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
      <PrimarySideBar
        activePane={primaryPaneCollapsed ? null : primaryPane}
        onClick={handleSideBarClick}
        onSettingsClick={onSettingsClick}
      />
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
  const panelRef = React.useRef<ImperativePanelHandle>(null);

  useEffect(() => {
    if (closed) {
      panelRef.current?.collapse();
    } else {
      panelRef.current?.expand();
    }
  }, [panelRef, closed]);

  return (
    <>
      <VerticalResizeHandle />
      <Panel collapsible ref={panelRef} onCollapse={setClosed}>
        <AIPanel onCloseClick={() => setClosed(true)} />
        {closed && (
          <div className="absolute bottom-0 right-0 flex border border-slate-300 bg-slate-100 px-4 py-2">
            <div
              className="flex w-60 cursor-pointer select-none items-center justify-between"
              onClick={() => setClosed(false)}
            >
              <div>AI</div>
              <div>
                <VscChevronUp />
              </div>
            </div>
          </div>
        )}
      </Panel>
    </>
  );
}

export default App;
