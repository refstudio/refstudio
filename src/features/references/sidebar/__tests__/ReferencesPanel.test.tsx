import { runGetAtomHook, runSetAtomHook } from '../../../../atoms/__tests__/test-utils';
import { activePaneContentAtom } from '../../../../atoms/paneActions';
import { setReferencesAtom } from '../../../../atoms/referencesState';
import { buildEditorId } from '../../../../atoms/types/EditorData';
import { emitEvent, RefStudioEventName, RefStudioEventPayload } from '../../../../events';
import { act, screen, setupWithJotaiProvider, waitFor, within } from '../../../../test/test-utils';
import { REFERENCES } from '../../__tests__/test-fixtures';
import { ReferencesPanel } from '../ReferencesPanel';

vi.mock('../../../../events');
vi.mock('../../../../io/filesystem');

describe('ReferencesPanel', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should display welcome message with empty references', () => {
    setupWithJotaiProvider(<ReferencesPanel />);
    expect(screen.getByText('REFERENCES')).toBeInTheDocument();
    expect(screen.getByText(/welcome to your refstudio references library/i)).toBeInTheDocument();
  });

  it.each<{ title: string; event: RefStudioEventName }>([
    { title: 'Add References', event: 'refstudio://menu/references/upload' },
    { title: 'Open References', event: 'refstudio://menu/references/open' },
    { title: 'Export References (NOT IMPLEMENTED)', event: 'refstudio://menu/references/export' },
  ])('should trigger $title on click', async ({ title, event }) => {
    const { user } = setupWithJotaiProvider(<ReferencesPanel />);
    await user.click(screen.getByTitle(title));
    expect(vi.mocked(emitEvent)).toBeCalledWith(event);
  });

  it('should display ReferencesList with references', () => {
    const { store } = setupWithJotaiProvider(<ReferencesPanel />);
    const setReferences = runSetAtomHook(setReferencesAtom, store);

    act(() => setReferences.current(REFERENCES));

    expect(screen.queryByText(/welcome to your refstudio references library/i)).not.toBeInTheDocument();
    expect(screen.getByText(REFERENCES[0].title)).toBeInTheDocument();
    expect(screen.getByText(REFERENCES[1].title)).toBeInTheDocument();
  });

  it('should filter ReferencesList with text', async () => {
    const { store, user } = setupWithJotaiProvider(<ReferencesPanel />);
    const setReferences = runSetAtomHook(setReferencesAtom, store);

    const [ref1, ref2] = REFERENCES;
    act(() => setReferences.current(REFERENCES));

    await user.type(screen.getByPlaceholderText('Filter (e.g. title, author)'), ref1.title);

    // The filter is debounced
    await waitFor(() => expect(screen.queryByText(ref2.title)).not.toBeInTheDocument());
    expect(screen.getByText(ref1.title)).toBeInTheDocument();
  });

  it('should open reference on click', async () => {
    const { store, user } = setupWithJotaiProvider(<ReferencesPanel />);
    const setReferences = runSetAtomHook(setReferencesAtom, store);
    const [ref1] = REFERENCES;
    act(() => setReferences.current(REFERENCES));

    await user.click(screen.getByText(ref1.title));

    const active = runGetAtomHook(activePaneContentAtom, store);
    expect(active.current.activeEditor?.id).toBeDefined();
    expect(active.current.activeEditor?.id).toBe(buildEditorId('reference', ref1.id));
  });

  it('should open reference PDF on PDF icon click', async () => {
    const { store, user } = setupWithJotaiProvider(<ReferencesPanel />);
    const setReferences = runSetAtomHook(setReferencesAtom, store);
    const [ref1] = REFERENCES;
    act(() => setReferences.current(REFERENCES));

    const elem = screen.getByRole('listitem', { name: ref1.title });

    await user.hover(elem);
    await user.click(within(elem).getByTitle('Open PDF'));

    const active = runGetAtomHook(activePaneContentAtom, store);
    expect(active.current.activeEditor?.id).toBeDefined();
    expect(active.current.activeEditor?.id).toBe(buildEditorId('text', ref1.filepath));
  });

  it('should open references table on author click', async () => {
    const { store, user } = setupWithJotaiProvider(<ReferencesPanel />);
    const setReferences = runSetAtomHook(setReferencesAtom, store);
    const [ref1] = REFERENCES;
    act(() => setReferences.current(REFERENCES));

    const elem = screen.getAllByText(ref1.authors[0].lastName);
    await user.click(elem[0]);

    const active = runGetAtomHook(activePaneContentAtom, store);
    expect(active.current.activeEditor?.id).toBeDefined();
    expect(active.current.activeEditor?.id).toBe(buildEditorId('references'));
  });

  it(`should emit ${'refstudio://references/remove' as RefStudioEventName} on remove clicked`, async () => {
    const { store, user } = setupWithJotaiProvider(<ReferencesPanel />);
    const setReferences = runSetAtomHook(setReferencesAtom, store);
    const [ref1] = REFERENCES;
    act(() => setReferences.current(REFERENCES));

    const elem = screen.getByRole('listitem', { name: ref1.title });

    await user.hover(elem);
    await user.click(within(elem).getByTitle('Remove Reference'));

    expect(vi.mocked(emitEvent)).toBeCalled();
    expect(vi.mocked(emitEvent)).toBeCalledWith<
      [RefStudioEventName, RefStudioEventPayload<'refstudio://references/remove'>]
    >('refstudio://references/remove', { referenceIds: [ref1.id] });
  });
});
