import { createStore } from 'jotai';

import { runGetAtomHook, runSetAtomHook } from '../../../../atoms/__tests__/test-utils';
import { activePaneContentAtom } from '../../../../atoms/paneActions';
import { setReferencesAtom } from '../../../../atoms/referencesState';
import { buildEditorId } from '../../../../atoms/types/EditorData';
import { emitEvent } from '../../../../events';
import { getAppDataDir } from '../../../../io/filesystem';
import { screen, setupWithJotaiProvider, waitFor, within } from '../../../../test/test-utils';
import { REFERENCES } from '../../__tests__/test-fixtures';
import { UploadTipInstructions } from '../../components/UploadTipInstructions';
import { ReferencesTableView } from '../ReferencesTableView';

vi.mock('../../../../events');
vi.mock('../../../../io/filesystem');

vi.mocked(getAppDataDir).mockResolvedValue('/');

describe('ReferencesTableView component', () => {
  let store: ReturnType<typeof createStore>;
  const [ref1, ref2] = REFERENCES;

  beforeEach(() => {
    store = createStore();
    const setReferences = runSetAtomHook(setReferencesAtom, store);
    setReferences.current(REFERENCES);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should render empty table with upload tips', () => {
    setupWithJotaiProvider(<ReferencesTableView />);
    expect(screen.getByTestId(UploadTipInstructions.name)).toBeInTheDocument();
  });

  it('should render references', () => {
    setupWithJotaiProvider(<ReferencesTableView />, store);
    expect(screen.getByText(REFERENCES[0].title)).toBeInTheDocument();
    expect(screen.getByText(REFERENCES[1].title)).toBeInTheDocument();
  });

  it('should use default filter to filter references', () => {
    setupWithJotaiProvider(<ReferencesTableView defaultFilter={ref1.title} />, store);
    expect(screen.getByPlaceholderText('Search within references...')).toHaveValue(ref1.title);
  });

  it('should filter references with default filter', () => {
    setupWithJotaiProvider(<ReferencesTableView defaultFilter={ref1.title} />, store);
    const grid = screen.getByRole('treegrid');
    expect(within(grid).getByText(ref1.title)).toBeInTheDocument();
    expect(within(grid).queryByText(ref2.title)).not.toBeInTheDocument();
  });

  it('should filter references with filter input', async () => {
    const { user } = setupWithJotaiProvider(<ReferencesTableView />, store);

    await user.type(screen.getByPlaceholderText('Search within references...'), ref1.title);

    const grid = screen.getByRole('treegrid');
    await waitFor(() => expect(within(grid).queryByText(ref2.title)).not.toBeInTheDocument());
    expect(within(grid).getByText(ref1.title)).toBeInTheDocument();
  });

  it('should select references in grid with SPACE', async () => {
    const { user } = setupWithJotaiProvider(<ReferencesTableView />, store);

    expect(screen.queryByText('(2)')).not.toBeInTheDocument();

    await user.type(screen.getByText(ref1.title), ' ', { skipClick: false }); // select row
    await user.type(screen.getByText(ref2.title), ' ', { skipClick: false }); // select row

    expect(screen.getByText('(2)')).toBeInTheDocument();
  });

  it('should render 8 columns', () => {
    setupWithJotaiProvider(<ReferencesTableView />, store);
    expect(screen.getAllByRole('columnheader')).toHaveLength(8);
  });

  it('should render title column in 3rd position', () => {
    setupWithJotaiProvider(<ReferencesTableView />, store);

    const headerTitle = screen.getByRole('columnheader', { name: 'Title' });
    expect(headerTitle).toBeInTheDocument();
    expect(headerTitle).toHaveAttribute('aria-colindex', '3');
  });

  it('should emit [refstudio://menu/references/upload] on Add click', async () => {
    const { user } = setupWithJotaiProvider(<ReferencesTableView />, store);

    await user.click(screen.getByText('Add'));
    expect(vi.mocked(emitEvent)).toHaveBeenCalledWith('refstudio://menu/references/upload');
  });

  it('should open reference details on click in icon Open Reference Details', async () => {
    const { user } = setupWithJotaiProvider(<ReferencesTableView />, store);

    const buttons = screen.getAllByText('Open Reference Details');
    expect(buttons).toHaveLength(REFERENCES.length);
    await user.click(buttons[0]);

    const active = runGetAtomHook(activePaneContentAtom, store);

    expect(active.current.activeEditor?.id).toBeDefined();
    expect(active.current.activeEditor?.id).toBe(buildEditorId('reference', ref1.id));
  });

  it('should open reference PDF details on click in icon Open Reference PDF', async () => {
    const { user } = setupWithJotaiProvider(<ReferencesTableView />, store);

    const buttons = screen.getAllByText('Open Reference PDF');
    expect(buttons).toHaveLength(REFERENCES.length);
    await user.click(buttons[0]);

    const active = runGetAtomHook(activePaneContentAtom, store);

    expect(active.current.activeEditor?.id).toBeDefined();
    expect(active.current.activeEditor?.id).toBe(buildEditorId('pdf', ref1.filepath));
  });
});
