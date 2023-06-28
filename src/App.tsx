import { useSetAtom } from 'jotai';
import React, { useCallback, useEffect, useState } from 'react';
import { VscChevronUp } from 'react-icons/vsc';
import { ImperativePanelHandle, Panel, PanelGroup } from 'react-resizable-panels';

import { openReferenceAtom } from './atoms/fileActions';
import { PrimarySideBar, PrimarySideBarPane } from './components/PrimarySideBar';
import { VerticalResizeHandle } from './components/VerticalResizeHandle';
import { emitEvent, RefStudioEvents } from './events';
import { AIPanel } from './panels/AIPanel';
import { ExplorerPanel } from './panels/ExplorerPanel';
import { MainPanel } from './panels/MainPanel';
import { ReferencesDropZone } from './references/components/ReferencesDropZone';
import { ReferencesPanel } from './references/sidebar/ReferencesPanel';
import { SettingsModalOpener } from './settings/SettingsModalOpener';
import { PdfViewerAPI } from './types/PdfViewerAPI';
import { ApplicationFrame } from './wrappers/ApplicationFrame';
import { EventsListener } from './wrappers/EventsListener';

function App() {
  const pdfViewerRef = React.useRef<PdfViewerAPI>(null);
  const updatePDFViewerWidth = useCallback(() => {
    pdfViewerRef.current?.updateWidth();
  }, [pdfViewerRef]);

  return (
    <EventsListener>
      <ReferencesDropZone>
        <ApplicationFrame>
          <PanelGroup
            autoSaveId="refstudio"
            className="relative h-full"
            direction="horizontal"
            onLayout={updatePDFViewerWidth}
          >
            <LeftSidePanelWrapper />
            <Panel defaultSize={60} order={2}>
              <MainPanel pdfViewerRef={pdfViewerRef} />
            </Panel>
            <RightPanelWrapper />
          </PanelGroup>
        </ApplicationFrame>
        <SettingsModalOpener />
      </ReferencesDropZone>
    </EventsListener>
  );
}

function LeftSidePanelWrapper() {
  const leftPanelRef = React.useRef<ImperativePanelHandle>(null);
  const [primaryPaneCollapsed, setPrimaryPaneCollapsed] = useState(false);
  const [primaryPane, setPrimaryPane] = useState<PrimarySideBarPane>('Explorer');
  const openReference = useSetAtom(openReferenceAtom);

  const handleSideBarClick = (selectedPane: PrimarySideBarPane) => {
    if (selectedPane === primaryPane) {
      // Toggle collapsing
      setPrimaryPaneCollapsed(!primaryPaneCollapsed);
    } else {
      // Always open the sidebar
      setPrimaryPaneCollapsed(false);
    }
    setPrimaryPane(selectedPane);
  };

  React.useEffect(() => {
    if (primaryPaneCollapsed) {
      leftPanelRef.current?.collapse();
    } else {
      leftPanelRef.current?.expand();
    }
  }, [leftPanelRef, primaryPaneCollapsed]);

  const openSettings = React.useCallback(() => emitEvent(RefStudioEvents.menu.settings), []);

  return (
    <>
      <PrimarySideBar
        activePane={primaryPaneCollapsed ? null : primaryPane}
        onClick={handleSideBarClick}
        onSettingsClick={openSettings}
      />
      <Panel
        collapsible
        defaultSize={20}
        order={1}
        ref={leftPanelRef}
        onCollapse={(collapsed) => setPrimaryPaneCollapsed(collapsed)}
      >
        {primaryPane === 'Explorer' && <ExplorerPanel />}
        {primaryPane === 'References' && <ReferencesPanel onRefClicked={(reference) => openReference(reference.id)} />}
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
      <Panel collapsible order={3} ref={panelRef} onCollapse={setClosed}>
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
