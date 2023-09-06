import { useCallback, useEffect, useRef, useState } from 'react';
import { ImperativePanelHandle, Panel } from 'react-resizable-panels';

import { VerticalResizeHandle } from '../../components/VerticalResizeHandle';
import { emitEvent } from '../../events';
import { ReferencesPanel } from '../../features/references/sidebar/ReferencesPanel';
import { useRefStudioHotkeys } from '../../hooks/useRefStudioHotkeys';
import { cx } from '../../lib/cx';
import { noop } from '../../lib/noop';
import { SideBar } from '../components/SideBar';
import { ExplorerPanel } from './ExplorerPanel';
import { FilesIcon, KeyboardIcon, ReferencesIcon, SettingsIcon } from './icons';

type PrimarySideBarPanel = 'Explorer' | 'References';
export function LeftSidePanelWrapper({ disabled }: { disabled?: boolean }) {
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(disabled);
  const [activePanel, setActivePanel] = useState<PrimarySideBarPanel>('Explorer');

  const handleSideBarClick = useCallback(
    (clickedPane: PrimarySideBarPanel) => {
      if (!disabled) {
        if (clickedPane === activePanel) {
          // Toggle collapsing
          setIsPanelCollapsed((currentPaneState) => !currentPaneState);
        } else {
          // Always open the sidebar
          setIsPanelCollapsed(false);
        }
        setActivePanel(clickedPane);
      }
    },
    [activePanel, disabled],
  );

  // Configure keyboard shortcuts to open/close side panel
  useRefStudioHotkeys(['meta+1'], () => handleSideBarClick('Explorer'));
  useRefStudioHotkeys(['meta+2'], () => handleSideBarClick('References'));

  useEffect(() => {
    if (isPanelCollapsed) {
      leftPanelRef.current?.collapse();
    } else {
      leftPanelRef.current?.expand();
    }
  }, [leftPanelRef, isPanelCollapsed]);

  useEffect(() => {
    if (disabled) {
      // Close the panel when disabled
      setIsPanelCollapsed(true);
    } else {
      // Open the defaut panel (Explorer) when enabled
      setIsPanelCollapsed(false);
      setActivePanel('Explorer');
    }
  }, [disabled]);

  const openSettings = useCallback(() => emitEvent('refstudio://menu/settings'), []);

  return (
    <>
      <SideBar
        activePane={isPanelCollapsed ? null : activePanel}
        className={cx({
          'border-r border-r-side-bar-border': !isPanelCollapsed,
          'shadow-default': isPanelCollapsed,
        })}
        footerItems={[
          { label: 'Keybinds', Icon: <KeyboardIcon />, onClick: noop }, // TODO: Implement Keybinds screen
          { label: 'Settings', Icon: <SettingsIcon />, onClick: openSettings },
        ]}
        items={[
          { disabled, pane: 'Explorer', Icon: <FilesIcon /> },
          { disabled, pane: 'References', Icon: <ReferencesIcon /> },
        ]}
        onItemClick={handleSideBarClick}
      />
      <Panel
        className="z-sidebar-panel shadow-default"
        collapsible
        order={1}
        ref={leftPanelRef}
        onCollapse={(collapsed) => {
          if (!disabled) {
            setIsPanelCollapsed(collapsed);
          } else if (!collapsed) {
            // When the sidebar is disabled, the panel should be collapsed
            // If the panel tries to update its state (because of layout stored in local storage), we prevent the update
            leftPanelRef.current?.collapse();
          }
        }}
      >
        {activePanel === 'Explorer' && <ExplorerPanel />}
        {activePanel === 'References' && <ReferencesPanel />}
      </Panel>
      {!disabled && <VerticalResizeHandle transparent />}
    </>
  );
}
