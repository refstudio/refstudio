import React, { useState } from 'react';
import { ImperativePanelHandle, Panel } from 'react-resizable-panels';

import { VerticalResizeHandle } from '../../components/VerticalResizeHandle';
import { ChatbotPanel } from '../../features/ai/sidebar/ChatPanel';
import { RewriterPanel } from '../../features/ai/sidebar/RewriterPanel';
import { cx } from '../../lib/cx';
import { SideBar } from '../components/SideBar';
import { BotIcon, PenIcon } from './icons';

type SecondarySideBarPane = 'Rewriter' | 'Chatbot';
export function RightSidePanelWrapper() {
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
      <SideBar
        activePane={secondaryPaneCollapsed ? null : secondaryPane}
        className={cx({ 'border-l-[1px] border-l-grayscale-20': !secondaryPaneCollapsed })}
        items={[
          { pane: 'Rewriter', Icon: <PenIcon /> },
          { pane: 'Chatbot', Icon: <BotIcon /> },
        ]}
        onItemClick={handleSideBarClick}
      />
    </>
  );
}
