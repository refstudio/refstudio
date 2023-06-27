import { createStore, Provider } from 'jotai';

import { setReferencesAtom } from '../atoms/referencesState';
import { runSetAtomHook } from '../atoms/test-utils';
import { UploadTipInstructions } from '../panels/references/UploadTipInstructions';
import { act, render, screen } from '../utils/test-utils';
import { ReferencesTableView } from './ReferencesTableView';

describe('ReferencesTableView component', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should render empty table with upload tips', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <ReferencesTableView />
      </Provider>,
    );
    expect(screen.getByTestId(UploadTipInstructions.name)).toBeInTheDocument();
  });

  it('should render references', () => {
    const store = createStore();
    const setReferences = runSetAtomHook(setReferencesAtom, store);

    const REFERENCES = [
      {
        id: 'A Few Useful Things to Know about Machine Learning.pdf',
        filename: 'A Few Useful Things to Know about Machine Learning.pdf',
        title: 'A Few Useful Things to Know about Machine Learning.pdf',
        citationKey: 'citationKey',
        authors: [],
        abstract: '',
      },
      {
        id: 'Rules of Machine Learning - Best Practices for ML Engineering.pdf',
        filename: 'Rules of Machine Learning - Best Practices for ML Engineering.pdf',
        title: 'Rules of Machine Learning - Best Practices for ML Engineering.pdf',
        citationKey: 'citationKey 2',
        authors: [],
        abstract: '',
      },
    ];

    act(() => setReferences.current(REFERENCES));

    render(
      <Provider store={store}>
        <ReferencesTableView />
      </Provider>,
    );
    expect(screen.getByText(REFERENCES[0].title)).toBeInTheDocument();
    expect(screen.getByText(REFERENCES[1].title)).toBeInTheDocument();
  });
});
