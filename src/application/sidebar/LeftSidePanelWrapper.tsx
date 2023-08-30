import { useCallback, useEffect, useRef, useState } from 'react';
import { MdKeyboard, MdSettings } from 'react-icons/md';
import { ImperativePanelHandle, Panel } from 'react-resizable-panels';

import { VerticalResizeHandle } from '../../components/VerticalResizeHandle';
import { emitEvent } from '../../events';
import { ReferencesPanel } from '../../features/references/sidebar/ReferencesPanel';
import { useRefStudioHotkeys } from '../../hooks/useRefStudioHotkeys';
import { cx } from '../../lib/cx';
import { noop } from '../../lib/noop';
import { SideBar } from '../components/SideBar';
import { ExplorerPanel } from './ExplorerPanel';
import { FilesIcon, ReferencesIcon } from './icons';

type PrimarySideBarPanel = 'Explorer' | 'References';
export function LeftSidePanelWrapper({ disabled }: { disabled?: boolean }) {
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(!disabled);
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
        className={cx({ 'border-r border-r-side-bar-border': !isPanelCollapsed })}
        footerItems={[
          // TODO: Implement Keybinds screen
          {
            label: 'Keybinds',
            Icon: <MdKeyboard aria-label="Keybindings" size="24" />,
            onClick: noop,
          },
          {
            label: 'Settings',
            Icon: <MdSettings aria-label="Settings" size="24" />,
            onClick: openSettings,
          },
        ]}
        items={[
          { disabled, pane: 'Explorer', Icon: <FilesIcon /> },
          { disabled, pane: 'References', Icon: <ReferencesIcon /> },
        ]}
        onItemClick={handleSideBarClick}
      />
      <Panel collapsible order={1} ref={leftPanelRef} onCollapse={(collapsed) => setIsPanelCollapsed(collapsed)}>
        {activePanel === 'Explorer' && <ExplorerPanel />}
        {activePanel === 'References' && <ReferencesPanel />}
      </Panel>
      <VerticalResizeHandle transparent />
    </>
  );
}
