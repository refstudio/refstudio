import { runSetAtomHook } from '../../../../atoms/__tests__/test-utils';
import { setReferencesAtom } from '../../../../atoms/referencesState';
import { emitEvent } from '../../../../events';
import { act, screen, setupWithJotaiProvider, waitFor, within } from '../../../../test/test-utils';
import { REFERENCES } from '../../__tests__/test-fixtures';
import { UploadTipInstructions } from '../../components/UploadTipInstructions';
import { ReferencesTableView } from '../ReferencesTableView';

vi.mock('../../../../events');

describe('ReferencesTableView component', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should render empty table with upload tips', () => {
    setupWithJotaiProvider(<ReferencesTableView />);
    expect(screen.getByTestId(UploadTipInstructions.name)).toBeInTheDocument();
  });

  it('should render references', () => {
    const { store } = setupWithJotaiProvider(<ReferencesTableView />);

    const setReferences = runSetAtomHook(setReferencesAtom, store);

    act(() => setReferences.current(REFERENCES));

    expect(screen.getByText(REFERENCES[0].title)).toBeInTheDocument();
    expect(screen.getByText(REFERENCES[1].title)).toBeInTheDocument();
  });

  it('should use default filter to filter references', () => {
    const [ref1] = REFERENCES;
    setupWithJotaiProvider(<ReferencesTableView defaultFilter={ref1.title} />);
    expect(screen.getByPlaceholderText('Search within references...')).toHaveValue(ref1.title);
  });

  it('should filter references with default filter', () => {
    const [ref1, ref2] = REFERENCES;
    const { store } = setupWithJotaiProvider(<ReferencesTableView defaultFilter={ref1.title} />);
    const setReferences = runSetAtomHook(setReferencesAtom, store);
    act(() => setReferences.current(REFERENCES));

    const grid = screen.getByRole('treegrid');
    expect(within(grid).getByText(ref1.title)).toBeInTheDocument();
    expect(within(grid).queryByText(ref2.title)).not.toBeInTheDocument();
  });

  it('should filter references with filter input', async () => {
    const [ref1, ref2] = REFERENCES;
    const { store, user } = setupWithJotaiProvider(<ReferencesTableView />);
    const setReferences = runSetAtomHook(setReferencesAtom, store);
    act(() => setReferences.current(REFERENCES));

    await user.type(screen.getByPlaceholderText('Search within references...'), ref1.title);

    const grid = screen.getByRole('treegrid');
    await waitFor(() => expect(within(grid).queryByText(ref2.title)).not.toBeInTheDocument());
    expect(within(grid).getByText(ref1.title)).toBeInTheDocument();
  });

  it('should select references in grid with SPACE', async () => {
    const [ref1, ref2] = REFERENCES;
    const { store, user } = setupWithJotaiProvider(<ReferencesTableView />);

    const setReferences = runSetAtomHook(setReferencesAtom, store);
    act(() => setReferences.current(REFERENCES));

    expect(screen.queryByText('(2)')).not.toBeInTheDocument();

    await user.type(screen.getByText(ref1.title), ' ', { skipClick: false }); // select row
    await user.type(screen.getByText(ref2.title), ' ', { skipClick: false }); // select row

    expect(screen.getByText('(2)')).toBeInTheDocument();
  });

  it('should render 7 columns', () => {
    const { store } = setupWithJotaiProvider(<ReferencesTableView />);
    const setReferences = runSetAtomHook(setReferencesAtom, store);
    act(() => setReferences.current(REFERENCES));

    expect(screen.getAllByRole('columnheader')).toHaveLength(7);
  });

  it('should render title column in 3rd position', () => {
    const { store } = setupWithJotaiProvider(<ReferencesTableView />);
    const setReferences = runSetAtomHook(setReferencesAtom, store);
    act(() => setReferences.current(REFERENCES));

    const elemDrag = screen.getByRole('columnheader', { name: 'Title' });
    expect(elemDrag).toBeInTheDocument();
    expect(elemDrag).toHaveAttribute('aria-colindex', '3');
  });

  it('should emit [refstudio://menu/references/upload] on Add click', async () => {
    const { user, store } = setupWithJotaiProvider(<ReferencesTableView />);
    const setReferences = runSetAtomHook(setReferencesAtom, store);
    act(() => setReferences.current(REFERENCES));

    await user.click(screen.getByText('Add'));

    expect(vi.mocked(emitEvent)).toHaveBeenCalledWith('refstudio://menu/references/upload');
  });
});
