import { screen, waitFor } from '@testing-library/react';
import { createStore } from 'jotai';

import { selectionAtom } from '../../../../atoms/selectionState';
import { setupWithJotaiProvider } from '../../../../test/test-utils';
import { RewriteWidget } from '../../../components/RewriteWidget';
import { SelectionPanelSection } from '../SelectionPanelSection';

vi.mock('../../../components/RewriteWidget');

describe('SelectionPanelSection', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
    vi.mock('../../../components/RewriteWidget', () => {
      const FakeRewriteWidget = vi.fn(() => null);
      return { RewriteWidget: FakeRewriteWidget };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should display message on blank selection', () => {
    setupWithJotaiProvider(<SelectionPanelSection />, store);
    expect(screen.getByText('Select some text in the editor to see it here.')).toBeInTheDocument();
    expect(RewriteWidget).not.toHaveBeenCalled();
  });

  it('should render RewriteWidget with selection debounded', async () => {
    store.set(selectionAtom, 'Some selected text');

    setupWithJotaiProvider(<SelectionPanelSection debounceMs={1} />, store);
    await waitFor(() => {
      expect(RewriteWidget).toHaveBeenCalled();
    });

    expect(vi.mocked(RewriteWidget).mock.lastCall![0]).toMatchObject({ selection: 'Some selected text' });
  });
});
