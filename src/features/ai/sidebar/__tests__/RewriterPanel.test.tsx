import { screen } from '@testing-library/react';
import { createStore } from 'jotai';

import { FlatSettingsSchema } from '../../../../api/api-types';
import { askForRewrite, AskForRewriteReturn } from '../../../../api/rewrite';
import { selectionAtom } from '../../../../atoms/selectionState';
import { getCachedSetting } from '../../../../settings/settingsManager';
import { setupWithJotaiProvider } from '../../../../test/test-utils';
import { RewriteOptionsView } from '../../../components/RewriteOptionsView';
import { RewriterPanel } from '../RewriterPanel';

global.CSS.supports = () => false;
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
}));

vi.mock('../../../../settings/settingsManager');
vi.mock('../../../../api/rewrite');

const mockSettings = {
  openai_chat_model: 'dont-care',
  openai_api_key: 'dont-care',
  openai_manner: 'scholarly',
  openai_temperature: 0.5,
} satisfies Partial<FlatSettingsSchema>;

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
    vi.mocked(getCachedSetting).mockImplementation((key) => {
      if (key in mockSettings) {
        return mockSettings[key as keyof typeof mockSettings];
      }
      throw new Error('UNEXPECTED CALL FOR KEY ' + key);
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
