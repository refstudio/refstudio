import { PanelWrapper } from '../components/PanelWrapper';
import { ChatPanelSection } from './ai/ChatPanelSection';
import { SelectionPanelSection } from './ai/SelectionPanelSection';

export function AIPanel({ onCloseClick }: { onCloseClick?: () => void }) {
  return (
    <PanelWrapper closable title="AI" onCloseClick={onCloseClick}>
      <SelectionPanelSection />
      <ChatPanelSection />
    </PanelWrapper>
  );
}
