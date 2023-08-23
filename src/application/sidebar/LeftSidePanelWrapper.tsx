import React, { useState } from 'react';
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

type PrimarySideBarPane = 'Explorer' | 'References';
export function LeftSidePanelWrapper() {
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
  useRefStudioHotkeys(['meta+1'], () => handleSideBarClick('Explorer'));
  useRefStudioHotkeys(['meta+2'], () => handleSideBarClick('References'));

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
        className={cx({ 'border-r-[1px] border-r-side-bar-border': !primaryPaneCollapsed })}
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
          { pane: 'Explorer', Icon: <FilesIcon /> },
          { pane: 'References', Icon: <ReferencesIcon /> },
        ]}
        onItemClick={handleSideBarClick}
      />
      <Panel collapsible order={1} ref={leftPanelRef} onCollapse={(collapsed) => setPrimaryPaneCollapsed(collapsed)}>
        {primaryPane === 'Explorer' && <ExplorerPanel />}
        {primaryPane === 'References' && <ReferencesPanel />}
      </Panel>
      <VerticalResizeHandle />
    </>
  );
}
