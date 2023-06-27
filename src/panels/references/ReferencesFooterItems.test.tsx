import { createStore, Provider } from 'jotai';

import { activePaneAtom } from '../../atoms/fileActions';
import { referencesSyncInProgressAtom, setReferencesAtom } from '../../atoms/referencesState';
import { runGetAtomHook, runSetAtomHook } from '../../atoms/test-utils';
import { emitEvent, listenEvent, RefStudioEventCallback, RefStudioEvents } from '../../events';
import { noop } from '../../utils/noop';
import { act, render, screen, setup } from '../../utils/test-utils';
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

  it('should listen RefStudioEvents.menu.references.open to open references', () => {
    let fireEvent: undefined | RefStudioEventCallback;
    let eventName = '';
    vi.mocked(listenEvent).mockImplementation(async (event: string, handler: RefStudioEventCallback) => {
      eventName = event;
      fireEvent = handler;
      await Promise.resolve();
      return noop();
    });

    const store = createStore();
    render(
      <Provider store={store}>
        <ReferencesFooterItems />
      </Provider>,
    );

    expect(eventName).toBe(RefStudioEvents.menu.references.open);
    expect(fireEvent).toBeDefined();
    act(() => fireEvent!({ event: eventName, windowLabel: '', id: 1, payload: undefined }));

    const opened = runGetAtomHook(activePaneAtom, store);
    expect(opened.current.openFiles).toHaveLength(1);
    expect(opened.current.activeFile).toBeDefined();
    expect(opened.current.activeFile).toBe('refstudio://references');
  });
});
