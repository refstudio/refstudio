import { useAtomValue } from 'jotai';
import { useDebounce } from 'usehooks-ts';

import { selectionAtom } from '../../../atoms/selectionState';
import { PanelSection } from '../../../components/PanelSection';
import { PanelWrapper } from '../../../components/PanelWrapper';
import { RewriteWidget } from '../../components/RewriteWidget';

export function RewriterPanel({ debounceMs = 200 }: { debounceMs?: number }) {
  const selection = useAtomValue(selectionAtom);
  const debouncedSelection = useDebounce(selection, debounceMs);

  return (
    <PanelWrapper title="Rewriter">
      <PanelSection title="Selection">
        {!debouncedSelection && <p className="mb-1 mt-4 px-4 italic">Select some text in the editor to see it here.</p>}
        {debouncedSelection && <RewriteWidget className="mb-6" selection={debouncedSelection} />}
      </PanelSection>
    </PanelWrapper>
  );
}
