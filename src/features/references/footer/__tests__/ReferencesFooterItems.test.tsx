import { activePaneAtom } from '../../../../atoms/editorActions';
import { referencesSyncInProgressAtom, setReferencesAtom } from '../../../../atoms/referencesState';
import { runGetAtomHook, runSetAtomHook } from '../../../../atoms/test-utils';
import { buildEditorId } from '../../../../atoms/types/EditorData';
import { emitEvent } from '../../../../events';
import { act, mockListenEvent, screen, setupWithJotaiProvider } from '../../../../test/test-utils';
import { REFERENCES } from '../../test-fixtures';
import { ReferencesFooterItems } from '../ReferencesFooterItems';

vi.mock('../../../../events');

describe('ReferencesFooterItems component', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should render empty without loading', () => {
    setupWithJotaiProvider(<ReferencesFooterItems />);
    expect(screen.getByText('References: 0')).toBeInTheDocument();
  });

  it('should render number of references ingested', () => {
    const { store } = setupWithJotaiProvider(<ReferencesFooterItems />);
    const setReferences = runSetAtomHook(setReferencesAtom, store);

    act(() => setReferences.current(REFERENCES));
    expect(screen.getByText(`References: ${REFERENCES.length}`)).toBeInTheDocument();
  });

  it('should render loading spinner', () => {
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
    expect(opened.current.activeEditorId).toBeDefined();
    expect(opened.current.activeEditorId).toBe(buildEditorId('references'));
  });
});
