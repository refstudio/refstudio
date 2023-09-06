import { createStore } from 'jotai';

import { runHookWithJotaiProvider } from '../../../../atoms/__tests__/test-utils';
import { useActiveEditorContentAtoms } from '../../../../atoms/hooks/useActiveEditorContentAtoms';
import { useActiveEditorId } from '../../../../atoms/hooks/useActiveEditorId';
import { setReferencesAtom } from '../../../../atoms/referencesState';
import { buildEditorId } from '../../../../atoms/types/EditorData';
import { emitEvent, RefStudioEventName } from '../../../../events';
import { screen, setupWithJotaiProvider, waitFor } from '../../../../test/test-utils';
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

  it('should trigger refstudio://menu/references/open on click', async () => {
    const { user } = setupWithJotaiProvider(<ReferencesPanel />);
    await user.click(screen.getByTitle('Open References'));
    expect(vi.mocked(emitEvent)).toBeCalledWith<[RefStudioEventName]>('refstudio://menu/references/open');
  });

  it('should display empty No Reference when the list is empty', () => {
    setupWithJotaiProvider(<ReferencesPanel />);

    expect(screen.getByText('No References')).toBeInTheDocument();
  });

  it('should trigger refstudio://menu/references/upload on click', async () => {
    const { user } = setupWithJotaiProvider(<ReferencesPanel />);
    await user.click(screen.getByText('Browse Reference'));
    expect(vi.mocked(emitEvent)).toBeCalledWith<[RefStudioEventName]>('refstudio://menu/references/upload');
  });

  it('should display ReferencesList with references', () => {
    setupWithJotaiProvider(<ReferencesPanel />, store);

    expect(screen.queryByText('No References')).not.toBeInTheDocument();
    expect(screen.getByText(ref1.title)).toBeInTheDocument();
    expect(screen.getByText(ref2.title)).toBeInTheDocument();
  });

  it('should filter ReferencesList with text', async () => {
    const { user } = setupWithJotaiProvider(<ReferencesPanel />, store);

    await user.type(screen.getByPlaceholderText('Filter author/title...'), ref1.title);

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

  it('should have disabled export button when no reference is in the store', async () => {
    const { user } = setupWithJotaiProvider(<ReferencesPanel />);
    const exportButton = screen.getByTitle('Export References');

    expect(exportButton).toBeInTheDocument();

    await user.click(exportButton);
    expect(vi.mocked(emitEvent)).not.toBeCalled();
  });

  it("should emit 'refstudio://menu/references/export' when clicking on the export button", async () => {
    const { user } = setupWithJotaiProvider(<ReferencesPanel />, store);
    const exportButton = screen.getByTitle('Export References');

    expect(exportButton).toBeInTheDocument();

    await user.click(exportButton);
    expect(vi.mocked(emitEvent)).toBeCalledWith<[RefStudioEventName]>('refstudio://menu/references/export');
  });
});
