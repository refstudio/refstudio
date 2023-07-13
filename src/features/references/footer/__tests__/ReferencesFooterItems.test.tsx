import { createStore } from 'jotai';

import { runGetAtomHook, runSetAtomHook } from '../../../../atoms/__tests__/test-utils';
import { activePaneAtom } from '../../../../atoms/editorActions';
import { referencesSyncInProgressAtom, setReferencesAtom } from '../../../../atoms/referencesState';
import { buildEditorId } from '../../../../atoms/types/EditorData';
import { emitEvent } from '../../../../events';
import { act, mockListenEvent, screen, setupWithJotaiProvider } from '../../../../test/test-utils';
import { REFERENCES } from '../../__tests__/test-fixtures';
import { ReferencesFooterItems } from '../ReferencesFooterItems';

vi.mock('../../../../events');
vi.mock('../../../../api/ingestion');

describe('ReferencesFooterItems component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render with 0 references, and no sync in progess indicator', () => {
    setupWithJotaiProvider(<ReferencesFooterItems />);

    expect(screen.getByText('References: 0')).toBeInTheDocument();
  });

  it('should render number of references ingested', () => {
    const store = createStore();
    store.set(setReferencesAtom, REFERENCES);
    setupWithJotaiProvider(<ReferencesFooterItems />, store);

    expect(screen.getByText(`References: ${REFERENCES.length}`)).toBeInTheDocument();
  });

  it('should render sync in progress spinner', () => {
    const { store } = setupWithJotaiProvider(<ReferencesFooterItems />);
    const setSync = runSetAtomHook(referencesSyncInProgressAtom, store);

    expect(screen.queryByText('References ingestion...')).not.toBeInTheDocument();
    act(() => setSync.current(true));
    expect(screen.getByText('References ingestion...')).toBeInTheDocument();
  });

  it(`should emit ${'refstudio://menu/references/open'} on click`, async () => {
    const { user } = setupWithJotaiProvider(<ReferencesFooterItems />);
    await user.click(screen.getByRole('listitem'));
    expect(vi.mocked(emitEvent)).toHaveBeenCalledWith('refstudio://menu/references/open');
  });

  it(`should listen ${'refstudio://menu/references/open'} to open references`, () => {
    const mockData = mockListenEvent();
    const { store } = setupWithJotaiProvider(<ReferencesFooterItems />);

    expect(mockData.registeredEventNames).toContain('refstudio://menu/references/open');
    act(() => mockData.trigger('refstudio://menu/references/open'));

    const opened = runGetAtomHook(activePaneAtom, store);
    expect(opened.current.openEditorIds).toHaveLength(1);
    expect(opened.current.activeEditorId).not.toBeNull();
    expect(opened.current.activeEditorId).toBe(buildEditorId('references'));
  });
});
