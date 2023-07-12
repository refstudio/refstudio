import { createStore } from 'jotai';

import { runHookWithJotaiProvider } from '../../../../atoms/__tests__/test-utils';
import { useActiveEditorContentAtoms } from '../../../../atoms/hooks/useActiveEditorContentAtoms';
import { useActiveEditorId } from '../../../../atoms/hooks/useActiveEditorId';
import { setReferencesAtom } from '../../../../atoms/referencesState';
import { buildEditorId } from '../../../../atoms/types/EditorData';
import { emitEvent, RefStudioEventName, RefStudioEventPayload } from '../../../../events';
import { screen, setupWithJotaiProvider, waitFor, within } from '../../../../test/test-utils';
import { REFERENCES } from '../../__tests__/test-fixtures';
import { ReferencesPanel } from '../ReferencesPanel';

vi.mock('../../../../events');
vi.mock('../../../../io/filesystem');

describe('ReferencesPanel', () => {
  let store: ReturnType<typeof createStore>;
  const [ref1, ref2] = REFERENCES;

  beforeEach(() => {
    store = createStore();
    store.set(setReferencesAtom, REFERENCES);
  });
  afterEach(() => {
    vi.clearAllMocks();
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
    setupWithJotaiProvider(<ReferencesPanel />, store);

    expect(screen.queryByText(/welcome to your refstudio references library/i)).not.toBeInTheDocument();
    expect(screen.getByText(ref1.title)).toBeInTheDocument();
    expect(screen.getByText(ref2.title)).toBeInTheDocument();
  });

  it('should filter ReferencesList with text', async () => {
    const { user } = setupWithJotaiProvider(<ReferencesPanel />, store);

    await user.type(screen.getByPlaceholderText('Filter (e.g. title, author)'), ref1.title);

    // The filter is debounced
    await waitFor(() => expect(screen.queryByText(ref2.title)).not.toBeInTheDocument());
    expect(screen.getByText(ref1.title)).toBeInTheDocument();
  });

  it('should open reference on click', async () => {
    const { user } = setupWithJotaiProvider(<ReferencesPanel />, store);

    await user.click(screen.getByRole('listitem', { name: ref1.title }));

    const activeEditorId = runHookWithJotaiProvider(useActiveEditorId, store).current;
    expect(activeEditorId).not.toBeNull();
    expect(activeEditorId).toBe(buildEditorId('reference', ref1.id));
  });

  it('should open reference PDF on PDF icon click', async () => {
    const { user } = setupWithJotaiProvider(<ReferencesPanel />, store);

    const elem = screen.getByRole('listitem', { name: ref1.title });

    await user.hover(elem);
    await user.click(within(elem).getByTitle('Open PDF'));

    const activeEditorId = runHookWithJotaiProvider(useActiveEditorId, store).current;
    expect(activeEditorId).not.toBeNull();
    expect(activeEditorId).toBe(buildEditorId('pdf', ref1.filepath));
  });

  it('should open references table on author click', async () => {
    const { user } = setupWithJotaiProvider(<ReferencesPanel />, store);

    const elem = screen.getAllByText(ref1.authors[0].lastName);
    await user.click(elem[0]);

    const activeEditorId = runHookWithJotaiProvider(useActiveEditorId, store).current;
    expect(activeEditorId).not.toBeNull();
    expect(activeEditorId).toBe(buildEditorId('references'));

    const activeEditorContentAtoms = runHookWithJotaiProvider(useActiveEditorContentAtoms, store).current;
    const editorContent = store.get(activeEditorContentAtoms!.loadableEditorContentAtom);
    if (editorContent.state === 'hasData' && editorContent.data.type === 'references') {
      expect(editorContent.data.filter).toBe(ref1.authors[0].lastName);
    } else {
      fail('Unexpected editorContent');
    }
  });

  it(`should emit ${'refstudio://references/remove' as RefStudioEventName} on remove clicked`, async () => {
    const { user } = setupWithJotaiProvider(<ReferencesPanel />, store);

    const elem = screen.getByRole('listitem', { name: ref1.title });

    await user.hover(elem);
    await user.click(within(elem).getByTitle('Remove Reference'));

    expect(vi.mocked(emitEvent)).toBeCalled();
    expect(vi.mocked(emitEvent)).toBeCalledWith<
      [RefStudioEventName, RefStudioEventPayload<'refstudio://references/remove'>]
    >('refstudio://references/remove', { referenceIds: [ref1.id] });
  });
});
