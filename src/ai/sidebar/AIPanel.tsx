import { PanelWrapper } from '../../components/PanelWrapper';
import { ChatPanelSection } from './ChatPanelSection';
import { SelectionPanelSection } from './SelectionPanelSection';

export function AIPanel({ onCloseClick }: { onCloseClick?: () => void }) {
  return (
    <PanelWrapper closable title="AI" onCloseClick={onCloseClick}>
      <SelectionPanelSection />
      <ChatPanelSection />
    </PanelWrapper>
  );
}
