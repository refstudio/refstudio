import { createStore } from 'jotai';

import { makeFile, makeFolder } from '../../../atoms/__tests__/test-fixtures';
import { fileExplorerEntryPathBeingRenamed } from '../../../atoms/fileExplorerActions';
import { FileFileEntry } from '../../../atoms/types/FileEntry';
import { emitEvent, RefStudioEventName, RefStudioEventPayload } from '../../../events';
import { readAllProjectFiles } from '../../../io/filesystem';
import { act, render, screen, setup, setupWithJotaiProvider } from '../../../test/test-utils';
import { FileExplorer } from '../FileExplorer';

const renameEventName: RefStudioEventName = 'refstudio://explorer/rename';

vi.mock('../../../events');
vi.mock('../../../io/filesystem');

describe('FileExplorer', () => {
  let fileEntry: FileFileEntry;
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();

    fileEntry = makeFile('File 1.pdf');
    store.set(fileExplorerEntryPathBeingRenamed, null);
    vi.mocked(readAllProjectFiles).mockResolvedValue([fileEntry]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render a file', async () => {
    render(<FileExplorer />);
    expect(await screen.findByText(fileEntry.name)).toBeInTheDocument();
  });

  it('should call onFileClick with file path', async () => {
    const { user } = setup(<FileExplorer />);

    await user.click(await screen.findByText(fileEntry.name));

    expect(emitEvent).toHaveBeenCalledTimes(1);
    expect(emitEvent).toHaveBeenCalledWith<
      ['refstudio://explorer/open', RefStudioEventPayload<'refstudio://explorer/open'>]
    >('refstudio://explorer/open', { path: fileEntry.path });
  });

  it('should render a folder and its children', async () => {
    const file = makeFile('File 1.pdf');
    const folder = makeFolder('Folder', [file]);
    vi.mocked(readAllProjectFiles).mockResolvedValue([folder]);

    const { user } = setup(<FileExplorer />);
    expect(await screen.findByText(folder.name)).toBeInTheDocument();

    // Folder is collapsed by default
    expect(screen.queryByText(file.name)).not.toBeInTheDocument();
    await act(async () => {
      await user.click(screen.getByText(folder.name));
    });
    expect(screen.getByText(file.name)).toBeInTheDocument();
  });

  describe('FileExplorer - rename', () => {
    beforeEach(() => {
      store.set(fileExplorerEntryPathBeingRenamed, fileEntry.path);
    });

    it('should render an input when file is being renamed', async () => {
      setupWithJotaiProvider(<FileExplorer />, store);

      const inputElement = await screen.findByRole('textbox');
      expect(inputElement).toBeInTheDocument();
      expect(inputElement).toHaveFocus();
    });

    it(`should emit ${renameEventName} when submitting the new name`, async () => {
      const { user } = setupWithJotaiProvider(<FileExplorer />, store);

      expect(await screen.findByRole('textbox')).toBeInTheDocument();
      await user.keyboard('File 2{Enter}');
      expect(emitEvent).toHaveBeenCalledTimes(1);
      expect(emitEvent).toHaveBeenCalledWith<
        ['refstudio://explorer/rename', RefStudioEventPayload<'refstudio://explorer/rename'>]
      >('refstudio://explorer/rename', { path: fileEntry.path, newName: 'File 2.pdf' });
    });

    it(`should not emit ${renameEventName} when a file with the same name already exists`, async () => {
      const file2 = makeFile('File 2.pdf');
      vi.mocked(readAllProjectFiles).mockResolvedValue([fileEntry, file2]);

      const { user } = setupWithJotaiProvider(<FileExplorer />, store);

      expect(await screen.findByRole('textbox')).toBeInTheDocument();
      await user.keyboard('File 2{Enter}');
      expect(emitEvent).not.toHaveBeenCalled();
    });

    it(`should not emit ${renameEventName} when the name starts with a '.'`, async () => {
      const { user } = setupWithJotaiProvider(<FileExplorer />, store);

      expect(await screen.findByRole('textbox')).toBeInTheDocument();
      await user.keyboard('.File 2{Enter}');
      expect(emitEvent).not.toHaveBeenCalled();
    });

    it(`should not emit ${renameEventName} when the name starts with a '.'`, async () => {
      const { user } = setupWithJotaiProvider(<FileExplorer />, store);

      expect(await screen.findByRole('textbox')).toBeInTheDocument();
      await user.keyboard('.File 2{Enter}');
      expect(emitEvent).not.toHaveBeenCalled();
    });

    it(`should not emit ${renameEventName} when the name contains with a '/'`, async () => {
      const { user } = setupWithJotaiProvider(<FileExplorer />, store);

      expect(await screen.findByRole('textbox')).toBeInTheDocument();
      await user.keyboard('invalid/name{Enter}');
      expect(emitEvent).not.toHaveBeenCalled();
    });

    it('should remove the input element when pressing Escape', async () => {
      const { user } = setupWithJotaiProvider(<FileExplorer />, store);

      expect(await screen.findByRole('textbox')).toBeInTheDocument();
      await user.keyboard('{Escape}');
      expect(store.get(fileExplorerEntryPathBeingRenamed)).toBeNull();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('should remove the input element when unfocusing', async () => {
      const { user } = setupWithJotaiProvider(<FileExplorer />, store);

      expect(await screen.findByRole('textbox')).toBeInTheDocument();
      await user.tab();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });
});
