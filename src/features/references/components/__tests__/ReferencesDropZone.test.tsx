import { runPDFIngestion } from '../../../../api/ingestion';
import { runGetAtomHook } from '../../../../atoms/__tests__/test-utils';
import { getReferencesAtom, referencesSyncInProgressAtom } from '../../../../atoms/referencesState';
import { RefStudioEvents, listenEvent } from '../../../../events';
import { uploadFiles } from '../../../../io/filesystem';
import { noop } from '../../../../lib/noop';
import { act, fireEvent, mockListenEvent, screen, setupWithJotaiProvider, waitFor } from '../../../../test/test-utils';
import { REFERENCES } from '../../__tests__/test-fixtures';
import { ReferencesDropZone } from '../ReferencesDropZone';

vi.mock('../../../../events');
vi.mock('../../../../io/filesystem');
vi.mock('../../../../api/ingestion');

describe('ReferencesDropZone', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should render children with', () => {
    vi.mocked(listenEvent).mockResolvedValue(noop);
    setupWithJotaiProvider(<ReferencesDropZone>This is the child content</ReferencesDropZone>);

    expect(screen.getByText('This is the child content')).toBeInTheDocument();
  });

  it('should render upload overlay hidden', () => {
    vi.mocked(listenEvent).mockResolvedValue(noop);
    setupWithJotaiProvider(<ReferencesDropZone>APP</ReferencesDropZone>);

    expect(screen.getByText('Release to upload files to your library')).toBeInTheDocument();
    expect(screen.getByTestId('release-files-message')).toHaveClass('hidden');
  });

  it('should display overlay visible on drag start', () => {
    vi.mocked(listenEvent).mockResolvedValue(noop);
    setupWithJotaiProvider(<ReferencesDropZone>APP</ReferencesDropZone>);

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
    const mockData = mockListenEvent();
    setupWithJotaiProvider(<ReferencesDropZone>APP</ReferencesDropZone>);

    // Expect to be registered
    expect(mockData.registeredEventName).toBe(RefStudioEvents.menu.references.upload);

    const input = screen.getByRole<HTMLInputElement>('form');
    const clickFn = vi.fn();
    input.click = clickFn;

    // Trigger menu action
    act(() => mockData.trigger());

    expect(clickFn).toHaveBeenCalled();
  });

  it('should start ingestion on PDF upload', async () => {
    vi.mocked(listenEvent).mockResolvedValue(noop);
    vi.mocked(runPDFIngestion).mockResolvedValue([REFERENCES[0]]);

    const { store } = setupWithJotaiProvider(<ReferencesDropZone>APP</ReferencesDropZone>);
    const syncInProgress = runGetAtomHook(referencesSyncInProgressAtom, store);
    const references = runGetAtomHook(getReferencesAtom, store);

    expect(syncInProgress.current).toBe(false);
    expect(references.current).toHaveLength(0);

    const target = screen.getByText('APP');
    fireEvent.dragEnter(target, {
      dataTransfer: {
        types: ['Files'],
      },
    });

    const file = new File(['(⌐□_□)'], REFERENCES[0].filename, { type: 'application/pdf' });

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
    expect(references.current).toStrictEqual([REFERENCES[0]]);
  });
});
