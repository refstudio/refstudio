import { createStore, Provider } from 'jotai';

import { runPDFIngestion } from '../../api/ingestion';
import { getReferencesAtom, referencesSyncInProgressAtom } from '../../atoms/referencesState';
import { runGetAtomHook } from '../../atoms/test-utils';
import { listenEvent, RefStudioEventCallback, RefStudioEvents } from '../../events';
import { uploadFiles } from '../../filesystem';
import { noop } from '../../utils/noop';
import { act, fireEvent, render, screen, waitFor } from '../../utils/test-utils';
import { ReferencesDropZone } from './ReferencesDropZone';

vi.mock('../../events');
vi.mock('../../filesystem');
vi.mock('../../api/ingestion');

describe('ReferencesDropZone', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should render children with', () => {
    vi.mocked(listenEvent).mockResolvedValue(noop);
    render(
      <Provider>
        <ReferencesDropZone>This is the child content</ReferencesDropZone>
      </Provider>,
    );
    expect(screen.getByText('This is the child content')).toBeInTheDocument();
  });

  it('should render upload overlay hidden', () => {
    vi.mocked(listenEvent).mockResolvedValue(noop);
    render(
      <Provider>
        <ReferencesDropZone>APP</ReferencesDropZone>
      </Provider>,
    );
    expect(screen.getByText('Release to upload files to your library')).toBeInTheDocument();
    expect(screen.getByTestId('release-files-message')).toHaveClass('hidden');
  });

  it('should display overlay visible on drag start', () => {
    vi.mocked(listenEvent).mockResolvedValue(noop);
    const store = createStore();
    render(
      <Provider store={store}>
        <ReferencesDropZone>APP</ReferencesDropZone>
      </Provider>,
    );

    const target = screen.getByText('APP');
    fireEvent.dragEnter(target, {
      dataTransfer: {
        types: ['Files'],
      },
    });

    expect(screen.getByTestId('release-files-message')).not.toHaveClass('hidden');

    fireEvent.dragLeave(target, {
      dataTransfer: {
        types: ['Files'],
      },
    });
  });

  it('should open file explorer on RefStudioEvents.menu.references.upload', () => {
    let evtHandler: undefined | RefStudioEventCallback;
    let eventName = '';
    vi.mocked(listenEvent).mockImplementation(async (event: string, handler: RefStudioEventCallback) => {
      eventName = event;
      evtHandler = handler;
      await Promise.resolve();
      return noop();
    });

    const store = createStore();
    render(
      <Provider store={store}>
        <ReferencesDropZone>APP</ReferencesDropZone>
      </Provider>,
    );

    // Expect to be registered
    expect(eventName).toBe(RefStudioEvents.menu.references.upload);
    expect(evtHandler).toBeDefined();

    const input = screen.getByRole<HTMLInputElement>('form');
    const clickFn = vi.fn();
    input.click = clickFn;

    // Trigger menu action
    act(() =>
      evtHandler!({ event: RefStudioEvents.menu.references.upload, windowLabel: '', id: 1, payload: undefined }),
    );

    // Note: I don't know how to check that the file modal is opened
    expect(clickFn).toHaveBeenCalled();
  });

  it('should start ingestion on PDF upload', async () => {
    vi.mocked(listenEvent).mockResolvedValue(noop);
    const REFERENCE = {
      id: 'ref.id',
      citationKey: 'citationKey',
      title: 'title',
      abstract: '',
      authors: [],
      filename: 'title.pdf',
      publishedDate: '2023-06-22',
    };
    vi.mocked(runPDFIngestion).mockResolvedValue([REFERENCE]);

    const store = createStore();
    const syncInProgress = runGetAtomHook(referencesSyncInProgressAtom, store);
    const references = runGetAtomHook(getReferencesAtom, store);

    render(
      <Provider store={store}>
        <ReferencesDropZone>APP</ReferencesDropZone>
      </Provider>,
    );

    expect(syncInProgress.current).toBe(false);
    expect(references.current).toHaveLength(0);

    const target = screen.getByText('APP');
    fireEvent.dragEnter(target, {
      dataTransfer: {
        types: ['Files'],
      },
    });

    const file = new File(['(⌐□_□)'], 'chucknorris.pdf', { type: 'application/pdf' });

    fireEvent.drop(target, {
      dataTransfer: {
        types: ['Files'],
        files: [file],
      },
    });

    expect(syncInProgress.current).toBe(true);

    await waitFor(() => {
      expect(uploadFiles).toBeCalledWith([file]);
    });

    await waitFor(() => {
      expect(runPDFIngestion).toBeCalled();
    });

    expect(references.current).toHaveLength(1);
    expect(references.current).toStrictEqual([REFERENCE]);
  });
});
