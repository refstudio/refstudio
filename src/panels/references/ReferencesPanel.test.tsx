import { createStore, Provider } from 'jotai';

import { getReferencesAtom, referencesSyncInProgressAtom, setReferencesAtom } from '../../atoms/referencesState';
import { runGetAtomHook, runSetAtomHook } from '../../atoms/test-utils';
import { emitEvent, RefStudioEvents } from '../../events';
import { noop } from '../../utils/noop';
import { act, render, screen, setup } from '../../utils/test-utils';
import { ReferencesPanel } from './ReferencesPanel';

vi.mock('../../events');

describe('ReferencesPanel', () => {
  it('should display welcome message with empty references', () => {
    render(
      <Provider>
        <ReferencesPanel onRefClicked={noop} />
      </Provider>,
    );
    expect(screen.getByText('REFERENCES')).toBeInTheDocument();
    expect(screen.getByText(/welcome to your refstudio references library/i)).toBeInTheDocument();
  });

  it('should display references list with non-empty references', () => {
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

  it('should display tip instructions', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <ReferencesPanel onRefClicked={noop} />
      </Provider>,
    );
    expect(screen.getByText(/or drag.drop PDF files for upload/i)).toBeInTheDocument();
  });

  it('should hide tip instructions during sync', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <ReferencesPanel onRefClicked={noop} />
      </Provider>,
    );

    const setSync = runSetAtomHook(referencesSyncInProgressAtom, store);
    act(() => setSync.current(true));

    expect(screen.queryByText(/or drag.drop PDF files for upload/i)).not.toBeInTheDocument();
  });

  it('should trigger upload event when click in CLICK HERE link', async () => {
    const store = createStore();
    const { user } = setup(
      <Provider store={store}>
        <ReferencesPanel onRefClicked={noop} />
      </Provider>,
    );

    await user.click(screen.getByText(/here/));

    expect(vi.mocked(emitEvent)).toHaveBeenCalledWith(RefStudioEvents.references.ingestion.upload);
  });

  it('should reset references when click in reset', async () => {
    const store = createStore();
    const { user } = setup(
      <Provider store={store}>
        <ReferencesPanel onRefClicked={noop} />
      </Provider>,
    );

    const setReferences = runSetAtomHook(setReferencesAtom, store);
    const getReferences = runGetAtomHook(getReferencesAtom, store);

    const SAMPLE_REFERENCE = {
      id: 'ref.id',
      citationKey: 'citationKey',
      title: 'Reference document title',
      abstract: '',
      authors: [],
      filename: 'title.pdf',
      publishedDate: '2023-06-22',
    };

    act(() => {
      setReferences.current([SAMPLE_REFERENCE]);
    });

    expect(getReferences.current).toStrictEqual([SAMPLE_REFERENCE]);

    await user.click(screen.getByText(/reset references store/));

    expect(getReferences.current).toStrictEqual([]);
  });
});
