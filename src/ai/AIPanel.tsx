import { PanelWrapper } from '../components/PanelWrapper';
import { ChatPanelSection } from './sidebar/ChatPanelSection';
import { SelectionPanelSection } from './sidebar/SelectionPanelSection';

export function AIPanel({ onCloseClick }: { onCloseClick?: () => void }) {
  return (
    <PanelWrapper closable title="AI" onCloseClick={onCloseClick}>
      <SelectionPanelSection />
      <ChatPanelSection />
    </PanelWrapper>
  );
}
