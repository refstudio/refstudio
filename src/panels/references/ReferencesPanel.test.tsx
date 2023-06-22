import { createStore, Provider } from 'jotai';

import { setReferencesAtom } from '../../atoms/referencesState';
import { runSetAtomHook } from '../../atoms/test-utils';
import { noop } from '../../utils/noop';
import { act, render, screen } from '../../utils/test-utils';
import { ReferencesPanel } from './ReferencesPanel';

describe('ReferencesPanel', () => {
  test('should display welcome message with empty references', () => {
    render(
      <Provider>
        <ReferencesPanel onRefClicked={noop} />
      </Provider>,
    );
    expect(screen.getByText('REFERENCES')).toBeInTheDocument();
    expect(screen.getByText(/welcome to your refstudio references library/i)).toBeInTheDocument();
  });

  test('should display references list with non-empty references', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <ReferencesPanel onRefClicked={noop} />
      </Provider>,
    );

    const setReferences = runSetAtomHook(setReferencesAtom, store);

    act(() => {
      setReferences.current([
        {
          id: 'ref.id',
          citationKey: 'citationKey',
          title: 'Reference document title',
          abstract: '',
          authors: [],
          filename: 'title.pdf',
          publishedDate: '2023-06-22',
        },
      ]);
    });

    expect(screen.queryByText(/welcome to your refstudio references library/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Reference document title/i)).toBeInTheDocument();
  });
});
