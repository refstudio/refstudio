import 'react-contexify/dist/ReactContexify.css';

import { MenuProvider } from 'kmenu';
import React, { useCallback, useEffect, useState } from 'react';
import { VscChevronUp } from 'react-icons/vsc';
import { ImperativePanelHandle, Panel, PanelGroup } from 'react-resizable-panels';
import { useEffectOnce, useEventListener } from 'usehooks-ts';

import { PrimarySideBar, PrimarySideBarPane } from '../components/PrimarySideBar';
import { VerticalResizeHandle } from '../components/VerticalResizeHandle';
import { emitEvent } from '../events';
import { AIPanel } from '../features/ai/AIPanel';
import { ReferencesDropZone } from '../features/references/components/ReferencesDropZone';
import { ReferencesPanel } from '../features/references/sidebar/ReferencesPanel';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import { SettingsModalOpener } from '../settings/SettingsModalOpener';
import { ApplicationFrame } from '../wrappers/ApplicationFrame';
import { ContextMenus } from '../wrappers/ContextMenus';
import { EventsListener } from '../wrappers/EventsListener';
import { CommandPalette } from './commands/CommandPalette';
import { MainPanel } from './components/MainPanel';
import { ExplorerPanel } from './sidebar/ExplorerPanel';

export function App() {
  useEffectOnce(() => emitEvent('refstudio://references/load'));

  const handleLayoutUpdate = useDebouncedCallback(
    useCallback(() => emitEvent('refstudio://layout/update'), []),
    200,
  );

  useEffect(() => {
    window.addEventListener('resize', handleLayoutUpdate);

    return () => {
      window.removeEventListener('resize', handleLayoutUpdate);
    };
  }, [handleLayoutUpdate]);

  return (
    <EventsListener>
      <ReferencesDropZone>
        <ApplicationFrame>
          <ContextMenus>
            <MenuProvider config={{ animationDuration: 0 }}>
              <CommandPalette />
              <PanelGroup
                autoSaveId="refstudio"
                className="relative h-full"
                direction="horizontal"
                onLayout={handleLayoutUpdate}
              >
                <LeftSidePanelWrapper />
                <Panel defaultSize={60} order={2}>
                  <MainPanel />
                </Panel>
                <RightPanelWrapper />
              </PanelGroup>
            </MenuProvider>
          </ContextMenus>
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

  // Configure keyboard shortcuts to open/close side panel
  useEventListener('keydown', (e) => {
    if (e.metaKey) {
      switch (e.key.toLowerCase()) {
        case '1':
          return handleSideBarClick('Explorer');
        case '2':
          return handleSideBarClick('References');
      }
    }
  });

  React.useEffect(() => {
    if (primaryPaneCollapsed) {
      leftPanelRef.current?.collapse();
    } else {
      leftPanelRef.current?.expand();
    }
  }, [leftPanelRef, primaryPaneCollapsed]);

  const openSettings = React.useCallback(() => emitEvent('refstudio://menu/settings'), []);

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
        {primaryPane === 'References' && <ReferencesPanel />}
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

  // Configure keyboard shortcuts to open/close side panel
  useEventListener('keydown', (e) => {
    if (e.metaKey && e.key.toLowerCase() === '0') {
      setClosed((current) => !current);
    }
  });

  return (
    <>
      <VerticalResizeHandle />
      <Panel collapsible order={3} ref={panelRef} onCollapse={setClosed}>
        <AIPanel onCloseClick={() => setClosed(true)} />
        {closed && (
          <div className="absolute bottom-0 right-0 flex border border-b-0 border-slate-300 bg-slate-100 px-4 py-2">
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
