import { createStore, Provider } from 'jotai';

import { referencesSyncInProgressAtom, setReferencesAtom } from '../../atoms/referencesState';
import { runSetAtomHook } from '../../atoms/test-utils';
import { act, render, screen } from '../../utils/test-utils';
import { ReferencesFooterItems } from './ReferencesFooterItems';

describe('ReferencesFooterItems component', () => {
  it('should render empty without loading', () => {
    const store = createStore();
    // const setReferences = runSetAtomHook(setReferencesAtom, store);
    render(
      <Provider store={store}>
        <ReferencesFooterItems />
      </Provider>,
    );
    expect(screen.getByText('References: 0')).toBeInTheDocument();
  });

  it('should render number of references ingested', () => {
    const store = createStore();
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
        {
          id: 'ref.id 2',
          citationKey: 'citationKey 2',
          title: 'Reference document title 2',
          abstract: '',
          authors: [],
          filename: 'title-2.pdf',
          publishedDate: '2023-06-22',
        },
      ]);
    });

    render(
      <Provider store={store}>
        <ReferencesFooterItems />
      </Provider>,
    );
    expect(screen.getByText('References: 2')).toBeInTheDocument();
  });

  it('should render loading spinner', () => {
    const store = createStore();
    const setSync = runSetAtomHook(referencesSyncInProgressAtom, store);

    render(
      <Provider store={store}>
        <ReferencesFooterItems />
      </Provider>,
    );

    expect(screen.queryByText('References ingestion...')).not.toBeInTheDocument();
    act(() => setSync.current(true));
    expect(screen.getByText('References ingestion...')).toBeInTheDocument();
  });
});
