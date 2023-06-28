import { setReferencesAtom } from '../../../atoms/referencesState';
import { runSetAtomHook } from '../../../atoms/test-utils';
import { act, screen, setupWithJotaiProvider } from '../../../test/test-utils';
import { UploadTipInstructions } from '../components/UploadTipInstructions';
import { REFERENCES } from '../test-fixtures';
import { ReferencesTableView } from './ReferencesTableView';

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
});
