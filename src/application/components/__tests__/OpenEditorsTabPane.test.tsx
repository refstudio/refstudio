import { createStore } from 'jotai';

import { makeFile } from '../../../atoms/__tests__/test-fixtures';
import { openReferenceAtom, openReferencesAtom } from '../../../atoms/editorActions';
import { openFileEntryAtom } from '../../../atoms/fileEntryActions';
import { setReferencesAtom } from '../../../atoms/referencesState';
import { REFERENCES } from '../../../features/references/__tests__/test-fixtures';
import { screen, setupWithJotaiProvider } from '../../../test/test-utils';
import { PdfEditorIcon, RefStudioEditorIcon } from '../icons';
import { OpenEditorsTabPane } from '../OpenEditorsTabPane';

vi.mock('../icons');
vi.mock('../../../io/filesystem');

describe('OpenEditorstabPane', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the RefStudio icon', () => {
    store.set(openFileEntryAtom, makeFile('test.refstudio'));
    setupWithJotaiProvider(<OpenEditorsTabPane paneId="LEFT" />, store);

    expect(screen.getByRole('tab')).toBeInTheDocument();
    expect(RefStudioEditorIcon).toHaveBeenCalled();
    expect(PdfEditorIcon).not.toHaveBeenCalled();
  });

  it('should render the PDF icon', () => {
    store.set(openFileEntryAtom, makeFile('test.pdf'));
    setupWithJotaiProvider(<OpenEditorsTabPane paneId="RIGHT" />, store);

    expect(screen.getByRole('tab')).toBeInTheDocument();
    expect(PdfEditorIcon).toHaveBeenCalled();
    expect(RefStudioEditorIcon).not.toHaveBeenCalled();
  });

  it('should not render any icon for a text file', () => {
    store.set(openFileEntryAtom, makeFile('test.txt'));
    setupWithJotaiProvider(<OpenEditorsTabPane paneId="RIGHT" />, store);

    expect(screen.getByRole('tab')).toBeInTheDocument();
    expect(RefStudioEditorIcon).not.toHaveBeenCalled();
    expect(PdfEditorIcon).not.toHaveBeenCalled();
  });

  it('should not render any icon for a json file', () => {
    store.set(openFileEntryAtom, makeFile('test.json'));
    setupWithJotaiProvider(<OpenEditorsTabPane paneId="RIGHT" />, store);

    expect(screen.getByRole('tab')).toBeInTheDocument();
    expect(RefStudioEditorIcon).not.toHaveBeenCalled();
    expect(PdfEditorIcon).not.toHaveBeenCalled();
  });

  it('should not render any icon for reference details editor', () => {
    store.set(setReferencesAtom, REFERENCES);
    store.set(openReferenceAtom, REFERENCES[0].id);
    setupWithJotaiProvider(<OpenEditorsTabPane paneId="RIGHT" />, store);

    expect(screen.getByRole('tab')).toBeInTheDocument();
    expect(RefStudioEditorIcon).not.toHaveBeenCalled();
    expect(PdfEditorIcon).not.toHaveBeenCalled();
  });

  it('should not render any icon for references table editor', () => {
    store.set(openReferencesAtom);
    setupWithJotaiProvider(<OpenEditorsTabPane paneId="LEFT" />, store);

    expect(screen.getByRole('tab')).toBeInTheDocument();
    expect(RefStudioEditorIcon).not.toHaveBeenCalled();
    expect(PdfEditorIcon).not.toHaveBeenCalled();
  });
});
