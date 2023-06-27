import { waitFor } from '@testing-library/react';
import { createStore, Provider } from 'jotai';

import { activePaneAtom } from '../../atoms/fileActions';
import { referencesSyncInProgressAtom, setReferencesAtom } from '../../atoms/referencesState';
import { runGetAtomHook, runSetAtomHook } from '../../atoms/test-utils';
import { emitEvent, RefStudioEvents } from '../../events';
import { act, mockListenEvent, render, screen, setup } from '../../utils/test-utils';
import { ReferencesFooterItems } from './ReferencesFooterItems';

vi.mock('../../events');

describe('ReferencesFooterItems component', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should render empty without loading', () => {
    const store = createStore();
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

  it('should emit RefStudioEvents.menu.references.open on click', async () => {
    const store = createStore();
    const { user } = setup(
      <Provider store={store}>
        <ReferencesFooterItems />
      </Provider>,
    );
    await user.click(screen.getByRole('listitem'));
    expect(vi.mocked(emitEvent)).toHaveBeenCalledWith(RefStudioEvents.menu.references.open);
  });

  it('should listen RefStudioEvents.menu.references.open to open references', async () => {
    const mockData = mockListenEvent();
    const store = createStore();
    render(
      <Provider store={store}>
        <ReferencesFooterItems />
      </Provider>,
    );

    await waitFor(() => expect(mockData.registeredEventName).toBeDefined());
    expect(mockData.registeredEventName).toBe(RefStudioEvents.menu.references.open);
    act(() => mockData.trigger());

    const opened = runGetAtomHook(activePaneAtom, store);
    expect(opened.current.openFiles).toHaveLength(1);
    expect(opened.current.activeFile).toBeDefined();
    expect(opened.current.activeFile).toBe('refstudio://references');
  });
});
