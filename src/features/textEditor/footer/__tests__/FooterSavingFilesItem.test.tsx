import { createStore } from 'jotai';

import { useSomeEditorIsBeingSaved } from '../../../../atoms/hooks/useSomeEditorIsBeingSaved';
import { screen, setupWithJotaiProvider } from '../../../../test/test-utils';
import { FooterSavingFilesItem } from '../FooterSavingFilesItem';

vi.mock('../../../../atoms/hooks/useSomeEditorIsBeingSaved');

describe('FooterSavingFilesItem', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
    vi.mocked(useSomeEditorIsBeingSaved).mockReturnValue(false);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should start with text "Saved"', () => {
    setupWithJotaiProvider(<FooterSavingFilesItem />, store);
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('should display "Saving..." when some file is dirty', () => {
    vi.mocked(useSomeEditorIsBeingSaved).mockReturnValue(true);

    setupWithJotaiProvider(<FooterSavingFilesItem />, store);
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });
});
