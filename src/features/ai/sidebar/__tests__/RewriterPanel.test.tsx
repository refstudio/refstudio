import { screen } from '@testing-library/react';
import { createStore } from 'jotai';

import { askForRewrite, AskForRewriteReturn } from '../../../../api/rewrite';
import { selectionAtom } from '../../../../atoms/selectionState';
import { getCachedSetting } from '../../../../settings/settingsManager';
import { setupWithJotaiProvider } from '../../../../test/test-utils';
import { RewriteOptionsView } from '../../../components/RewriteOptionsView';
import { RewriterPanel } from '../RewriterPanel';

vi.mock('../../../../settings/settingsManager');
vi.mock('../../../../api/rewrite');

describe('RewriterPanel component', () => {
  let store: ReturnType<typeof createStore>;
  let rewriteResolver: (response: AskForRewriteReturn) => void;

  beforeEach(() => {
    store = createStore();
    vi.mock('../../../components/RewriteOptionsView', async (importOriginal) => {
      const OriginalRewriteOptionsView = (await importOriginal<{ RewriteOptionsView: typeof RewriteOptionsView }>())
        .RewriteOptionsView;
      const FakeRewriteOptionsView = vi.fn((...args: Parameters<typeof RewriteOptionsView>) =>
        OriginalRewriteOptionsView(...args),
      );
      return { RewriteOptionsView: FakeRewriteOptionsView };
    });
    vi.mocked(getCachedSetting).mockReturnValue({
      api_key: 'API_KEY',
      chat_model: 'gpt',
      manner: 'scholarly',
      temperature: 0.5,
    });
    vi.mocked(askForRewrite).mockImplementation(
      () =>
        new Promise<AskForRewriteReturn>((resolve) => {
          rewriteResolver = resolve;
        }),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should display message on blank selection', () => {
    setupWithJotaiProvider(<RewriterPanel />, store);
    expect(screen.getByText('Select some text in the editor to see it here.')).toBeInTheDocument();
  });

  it('should render RewriteOptionsView with selection debounced', () => {
    store.set(selectionAtom, 'Some selected text');

    setupWithJotaiProvider(<RewriterPanel />, store);
    expect(screen.getByText('Some selected text')).toBeInTheDocument();
  });

  it('should show the loading status', async () => {
    store.set(selectionAtom, 'Some selected text');

    const { user } = setupWithJotaiProvider(<RewriterPanel />, store);

    await user.click(screen.getByText('Rewrite'));

    expect(vi.mocked(RewriteOptionsView).mock.lastCall![0].isFetching).toBe(true);
  });

  it('should switch to the suggestion screen', async () => {
    store.set(selectionAtom, 'Some selected text');

    const { user } = setupWithJotaiProvider(<RewriterPanel />, store);

    await user.click(screen.getByText('Rewrite'));
    rewriteResolver({ ok: true, choices: ['Rewritten suggestion'] });

    expect(await screen.findByText('Rewritten suggestion')).toBeInTheDocument();
  });
});
