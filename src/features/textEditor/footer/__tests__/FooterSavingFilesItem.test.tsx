import { createStore } from 'jotai';

import { useAnyEditorDataIsDirty } from '../../../../atoms/hooks/useAnyEditorDataIsDirty';
import { screen, setupWithJotaiProvider } from '../../../../test/test-utils';
import { FooterSavingFilesItem } from '../FooterSavingFilesItem';

vi.mock('../../../../atoms/hooks/useAnyEditorDataIsDirty');

describe('FooterSavingFilesItem', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
    vi.mocked(useAnyEditorDataIsDirty).mockReturnValue(false);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should start with text "Saved"', () => {
    setupWithJotaiProvider(<FooterSavingFilesItem />, store);
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('should display "Saving..." when some file is dirty', () => {
    vi.mocked(useAnyEditorDataIsDirty).mockReturnValue(true);

    setupWithJotaiProvider(<FooterSavingFilesItem />, store);
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });
});
