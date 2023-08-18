import 'react-contexify/dist/ReactContexify.css';

import { MenuProvider } from 'kmenu';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import { ImperativePanelGroupHandle, ImperativePanelHandle, Panel, PanelGroup } from 'react-resizable-panels';
import { useEventListener, useLocalStorage, useWindowSize } from 'usehooks-ts';

import { VerticalResizeHandle } from '../components/VerticalResizeHandle';
import { emitEvent } from '../events';
import { ChatbotPanel } from '../features/ai/sidebar/ChatPanel';
import { RewriterPanel } from '../features/ai/sidebar/RewriterPanel';
import { ReferencesDropZone } from '../features/references/components/ReferencesDropZone';
import { ReferencesPanel } from '../features/references/sidebar/ReferencesPanel';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import { SettingsModalOpener } from '../settings/SettingsModalOpener';
import { ApplicationFrame } from '../wrappers/ApplicationFrame';
import { ContextMenus } from '../wrappers/ContextMenus';
import { EventsListener } from '../wrappers/EventsListener';
import { CommandPalette } from './commands/CommandPalette';
import { MainPanel } from './components/MainPanel';
import { SideBar } from './components/SideBar';
import { ExplorerPanel } from './sidebar/ExplorerPanel';
import { BotIcon } from './sidebar/icons/BotIcon';
import { FilesIcon } from './sidebar/icons/FilesIcon';
import { KeybindsIcon } from './sidebar/icons/KeybindsIcon';
import { PenIcon } from './sidebar/icons/PenIcon';
import { ReferencesIcon } from './sidebar/icons/ReferencesIcon';
import { SettingsIcon } from './sidebar/icons/SettingsIcon';

export function App() {
  const panelRef = React.createRef<ImperativePanelGroupHandle>();
  const size = useWindowSize();
  const [panelDimensions, setPanelDimensions] = useLocalStorage('refstudio.panels', { left: 400, right: 400 });

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
                <RightSidePanelWrapper />
              </PanelGroup>
            </MenuProvider>
          </ContextMenus>
        </ApplicationFrame>
        <SettingsModalOpener />
      </ReferencesDropZone>
    </EventsListener>
  );
}

type PrimarySideBarPane = 'Explorer' | 'References';
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
      <SideBar
        activePane={primaryPaneCollapsed ? null : primaryPane}
        footerItems={[
          { label: 'Keybinds', Icon: KeybindsIcon, onClick: () => console.log('keybinds') },
          { label: 'Settings', Icon: SettingsIcon, onClick: openSettings },
        ]}
        panes={[
          { pane: 'Explorer', Icon: FilesIcon },
          { pane: 'References', Icon: ReferencesIcon },
        ]}
        onItemClick={handleSideBarClick}
      />
      {!primaryPaneCollapsed && <div className='h-full w-[1px]' style={{ backgroundColor: '#eff1f4' }} />}
      <Panel collapsible order={1} ref={leftPanelRef} onCollapse={(collapsed) => setPrimaryPaneCollapsed(collapsed)}>
        {primaryPane === 'Explorer' && <ExplorerPanel />}
        {primaryPane === 'References' && <ReferencesPanel />}
      </Panel>
      <VerticalResizeHandle />
    </>
  );
}

type SecondarySideBarPane = 'Rewriter' | 'Chatbot';
function RightSidePanelWrapper() {
  const rightPanelRef = React.useRef<ImperativePanelHandle>(null);
  const [secondaryPaneCollapsed, setSecondaryPaneCollapsed] = useState(true);
  const [secondaryPane, setSecondaryPane] = useState<SecondarySideBarPane>('Rewriter');

  const handleSideBarClick = (selectedPane: SecondarySideBarPane) => {
    if (selectedPane === secondaryPane) {
      // Toggle collapsing
      setSecondaryPaneCollapsed(!secondaryPaneCollapsed);
    } else {
      // Always open the sidebar
      setSecondaryPaneCollapsed(false);
    }
    setSecondaryPane(selectedPane);
  };

  React.useEffect(() => {
    if (secondaryPaneCollapsed) {
      rightPanelRef.current?.collapse();
    } else {
      rightPanelRef.current?.expand();
    }
  }, [rightPanelRef, secondaryPaneCollapsed]);

  return (
    <>
      <VerticalResizeHandle />
      <Panel collapsible order={3} ref={rightPanelRef} onCollapse={(collapsed) => setSecondaryPaneCollapsed(collapsed)}>
        {secondaryPane === 'Rewriter' && <RewriterPanel />}
        {secondaryPane === 'Chatbot' && <ChatbotPanel />}
      </Panel>
      {!secondaryPaneCollapsed && <div className='h-full w-[1px]' style={{ backgroundColor: '#eff1f4' }} />}
      <SideBar
        activePane={secondaryPaneCollapsed ? null : secondaryPane}
        panes={[
          { pane: 'Rewriter', Icon: PenIcon },
          { pane: 'Chatbot', Icon: BotIcon },
        ]}
        onItemClick={handleSideBarClick}
      />
    </>
  );
}
