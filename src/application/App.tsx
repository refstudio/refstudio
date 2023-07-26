import 'react-contexify/dist/ReactContexify.css';

import { MenuProvider } from 'kmenu';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { VscChevronUp } from 'react-icons/vsc';
import { ImperativePanelGroupHandle, ImperativePanelHandle, Panel, PanelGroup } from 'react-resizable-panels';
import { useEffectOnce, useLocalStorage, useWindowSize } from 'usehooks-ts';

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
  const panelRef = React.createRef<ImperativePanelGroupHandle>();
  const size = useWindowSize();
  const [panelDimensions, setPanelDimensions] = useLocalStorage('refstudio.panels', { left: 400, right: 400 });

  useEffectOnce(() => emitEvent('refstudio://references/load'));

  const handleLayoutUpdate = useDebouncedCallback(
    useCallback(
      ([leftPerc, , rightPerc]: number[]) => {
        if (size.width === 0) {
          return;
        }
        const left = Math.round(size.width * (leftPerc / 100));
        const right = Math.round(size.width * (rightPerc / 100));
        setPanelDimensions({ left, right });

        // Notify external components that the screen/layout was resized
        emitEvent('refstudio://layout/update');
      },
      [size, setPanelDimensions],
    ),
    200,
  );

  // React to width resize or panelDimensions resize (via setLayout/resize panels)
  useLayoutEffect(() => {
    if (!panelRef.current || size.width === 0) {
      return;
    }
    const layout = panelRef.current.getLayout();
    const leftPerc = Math.round((panelDimensions.left / size.width) * 100);
    const rightPerc = Math.round((panelDimensions.right / size.width) * 100);
    const centerPerc = 100 - leftPerc - rightPerc;
    const newLayout = [leftPerc, centerPerc, rightPerc];
    if (layout.join(',') !== newLayout.join(',')) {
      panelRef.current.setLayout(newLayout);
    }
  }, [panelRef, size, panelDimensions]);

  return (
    <EventsListener>
      <ReferencesDropZone>
        <ApplicationFrame>
          <ContextMenus>
            <MenuProvider config={{ animationDuration: 0 }}>
              <CommandPalette />
              <PanelGroup
                className="relative h-full"
                direction="horizontal"
                ref={panelRef}
                onLayout={handleLayoutUpdate}
              >
                <LeftSidePanelWrapper />
                <Panel order={2}>
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
      <Panel collapsible order={1} ref={leftPanelRef} onCollapse={(collapsed) => setPrimaryPaneCollapsed(collapsed)}>
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
