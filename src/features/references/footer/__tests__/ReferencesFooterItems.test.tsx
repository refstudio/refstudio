import { getIngestedReferences } from '../../../../api/ingestion';
import { runGetAtomHook, runSetAtomHook } from '../../../../atoms/__tests__/test-utils';
import { activePaneAtom } from '../../../../atoms/editorActions';
import { referencesSyncInProgressAtom, setReferencesAtom } from '../../../../atoms/referencesState';
import { buildEditorId } from '../../../../atoms/types/EditorData';
import { emitEvent } from '../../../../events';
import { act, mockListenEvent, screen, setupWithJotaiProvider, waitFor } from '../../../../test/test-utils';
import { ReferenceItem } from '../../../../types/ReferenceItem';
import { REFERENCES } from '../../__tests__/test-fixtures';
import { ReferencesFooterItems } from '../ReferencesFooterItems';

vi.mock('../../../../events');
vi.mock('../../../../api/ingestion');

describe('ReferencesFooterItems component', () => {
  let resolveFn: (item: ReferenceItem[]) => void;
  beforeEach(() => {
    vi.mocked(getIngestedReferences).mockReturnValue(
      new Promise((resolve) => {
        resolveFn = resolve;
      }),
    );
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render with 0 references, and no sync in progess indicator', () => {
    setupWithJotaiProvider(<ReferencesFooterItems />);

    expect(screen.getByText('References: 0')).toBeInTheDocument();
  });

  it('should render ingested references', async () => {
    const [oneReference] = REFERENCES;
    vi.mocked(getIngestedReferences).mockResolvedValue([oneReference]);
    setupWithJotaiProvider(<ReferencesFooterItems />);
    expect(screen.getByText('References: 0')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('References: 1')).toBeInTheDocument();
    });
  });

  it('should render number of references ingested', () => {
    const { store } = setupWithJotaiProvider(<ReferencesFooterItems />);
    const setReferences = runSetAtomHook(setReferencesAtom, store);

    act(() => setReferences.current(REFERENCES));
    expect(screen.getByText(`References: ${REFERENCES.length}`)).toBeInTheDocument();
  });

  it('should render sync in progress spinner', () => {
    const { store } = setupWithJotaiProvider(<ReferencesFooterItems />);
    const setSync = runSetAtomHook(referencesSyncInProgressAtom, store);

    expect(screen.queryByText('References ingestion...')).not.toBeInTheDocument();
    act(() => setSync.current(true));
    expect(screen.getByText('References ingestion...')).toBeInTheDocument();
  });

  it('should render number of references returned by getIngestedReferences', async () => {
    setupWithJotaiProvider(<ReferencesFooterItems />);
    act(() => resolveFn(REFERENCES));
    expect(await screen.findByText(`References: ${REFERENCES.length}`)).toBeInTheDocument();
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
