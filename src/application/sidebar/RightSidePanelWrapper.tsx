import { useCallback, useEffect, useRef, useState } from 'react';
import { ImperativePanelHandle, Panel } from 'react-resizable-panels';

import { VerticalResizeHandle } from '../../components/VerticalResizeHandle';
import { ChatbotPanel } from '../../features/ai/sidebar/ChatPanel';
import { RewriterPanel } from '../../features/ai/sidebar/RewriterPanel';
import { useRefStudioHotkeys } from '../../hooks/useRefStudioHotkeys';
import { cx } from '../../lib/cx';
import { SideBar } from '../components/SideBar';
import { BotIcon, PenIcon } from './icons';

type SecondarySideBarPanel = 'Rewriter' | 'Chatbot';
export function RightSidePanelWrapper({ disabled }: { disabled?: boolean }) {
  const rightPanelRef = useRef<ImperativePanelHandle>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(true);
  const [activePanel, setActivePanel] = useState<SecondarySideBarPanel>('Rewriter');

  const handleSideBarClick = useCallback(
    (clickedPanel: SecondarySideBarPanel) => {
      if (!disabled) {
        if (clickedPanel === activePanel) {
          // Toggle collapsing
          setIsPanelCollapsed((currentPaneState) => !currentPaneState);
        } else {
          // Always open the sidebar
          setIsPanelCollapsed(false);
        }
        setActivePanel(clickedPanel);
      }
    },
    [activePanel, disabled],
  );

  // Configure keyboard shortcuts to open/close side panel
  useRefStudioHotkeys(['meta+9'], () => handleSideBarClick('Rewriter'));
  useRefStudioHotkeys(['meta+0'], () => handleSideBarClick('Chatbot'));

  useEffect(() => {
    if (isPanelCollapsed) {
      rightPanelRef.current?.collapse();
    } else {
      rightPanelRef.current?.expand();
    }
  }, [rightPanelRef, isPanelCollapsed]);

  useEffect(() => {
    if (disabled) {
      // Close the panel when disabled
      setIsPanelCollapsed(true);
    }
  }, [disabled]);

  return (
    <>
      <VerticalResizeHandle transparent />
      <Panel collapsible order={3} ref={rightPanelRef} onCollapse={(collapsed) => setIsPanelCollapsed(collapsed)}>
        {activePanel === 'Rewriter' && <RewriterPanel />}
        {activePanel === 'Chatbot' && <ChatbotPanel />}
      </Panel>
      <SideBar
        activePane={isPanelCollapsed ? null : activePanel}
        className={cx({ 'border-l border-l-side-bar-border': !isPanelCollapsed })}
        items={[
          { disabled, pane: 'Rewriter', Icon: <PenIcon /> },
          { disabled, pane: 'Chatbot', Icon: <BotIcon /> },
        ]}
        onItemClick={handleSideBarClick}
      />
    </>
  );
}
