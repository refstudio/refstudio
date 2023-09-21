import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ImperativePanelHandle, Panel } from 'react-resizable-panels';
import { useWindowSize } from 'usehooks-ts';

import { VerticalResizeHandle } from '../../components/VerticalResizeHandle';
import { emitEvent } from '../../events';
import { ReferencesPanel } from '../../features/references/sidebar/ReferencesPanel';
import { useListenEvent } from '../../hooks/useListenEvent';
import { useRefStudioHotkeys } from '../../hooks/useRefStudioHotkeys';
import { cx } from '../../lib/cx';
import { SideBar } from '../components/SideBar';
import { ExplorerPanel } from './ExplorerPanel';
import { FilesIcon, KeyboardIcon, ReferencesIcon, SettingsIcon } from './icons';

export type PrimarySideBarPanel = 'Explorer' | 'References';
export function LeftSidePanelWrapper({ disabled }: { disabled?: boolean }) {
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(disabled);
  const [activePanel, setActivePanel] = useState<PrimarySideBarPanel>('Explorer');

  const size = useWindowSize();
  const minWidth = useMemo(() => (256 / size.width) * 100, [size.width]);

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
    }
  }, [disabled]);

  useListenEvent('refstudio://sidebars/open', ({ panel }) => {
    if (disabled) {
      return;
    }
    if (panel === 'Explorer' || panel === 'References') {
      setActivePanel(panel);
      setIsPanelCollapsed(false);
    }
  });

  const openSettings = useCallback(() => emitEvent('refstudio://menu/settings'), []);
  const openKbdShortcuts = useCallback(() => emitEvent('refstudio://menu/view/keyboard-shortcuts'), []);

  return (
    <>
      <SideBar
        activePane={isPanelCollapsed ? null : activePanel}
        className={cx({
          'border-r border-r-side-bar-border': !isPanelCollapsed,
          'shadow-default': isPanelCollapsed,
        })}
        footerItems={[
          { label: 'Keybinds', Icon: <KeyboardIcon />, onClick: openKbdShortcuts },
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
        minSize={Number.isFinite(minWidth) ? minWidth : undefined}
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
