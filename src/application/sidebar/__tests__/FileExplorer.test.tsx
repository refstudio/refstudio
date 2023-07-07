import { createStore } from 'jotai';

import { makeFileExplorerFileEntry, makeFileExplorerFolderEntry } from '../../../atoms/__tests__/test-fixtures';
import { fileExplorerEntryPathBeingRenamed } from '../../../atoms/fileExplorerActions';
import { FileExplorerFileEntry, FileExplorerFolderEntry } from '../../../atoms/types/FileExplorerEntry';
import { emitEvent, RefStudioEventName, RefStudioEventPayload } from '../../../events';
import { noop } from '../../../lib/noop';
import { act, render, screen, setup, setupWithJotaiProvider } from '../../../test/test-utils';
import { FileExplorer } from '../FileExplorer';

const renameEventName: RefStudioEventName = 'refstudio://explorer/rename';

vi.mock('../../../events');

describe('FileExplorer', () => {
  let fileEntry: FileExplorerFileEntry;
  let folderEntry: FileExplorerFolderEntry;
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();

    fileEntry = makeFileExplorerFileEntry('File 1.pdf');
    folderEntry = makeFileExplorerFolderEntry('root', [fileEntry], true).folderEntry;
    store.set(fileExplorerEntryPathBeingRenamed, fileEntry.path);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render a file', () => {
    render(<FileExplorer fileExplorerEntry={folderEntry} selectedFiles={[]} onFileClick={noop} />);
    expect(screen.getByText(fileEntry.name)).toBeInTheDocument();
  });

  it('should call onFileClick with file path', async () => {
    const onClick = vi.fn();
    const { user } = setup(<FileExplorer fileExplorerEntry={folderEntry} selectedFiles={[]} onFileClick={onClick} />);

    await user.click(screen.getByText(fileEntry.name));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(fileEntry.path);
  });

  it('should render a folder and its children', async () => {
    const file = makeFileExplorerFileEntry('File 1.pdf');
    const { folderEntry: folder } = makeFileExplorerFolderEntry('Folder', [file], false);
    const { folderEntry: rootFolder } = makeFileExplorerFolderEntry('', [folder], true);

    const { user } = setup(<FileExplorer fileExplorerEntry={rootFolder} selectedFiles={[]} onFileClick={noop} />);
    expect(screen.getByText(folder.name)).toBeInTheDocument();

    // Folder is collapsed by default
    expect(screen.queryByText(file.name)).not.toBeInTheDocument();
    await act(async () => {
      await user.click(screen.getByText(folder.name));
    });
    expect(screen.getByText(file.name)).toBeInTheDocument();
  });

  it('should render an input when file is being renamed', () => {
    setupWithJotaiProvider(
      <FileExplorer fileExplorerEntry={folderEntry} selectedFiles={[]} onFileClick={noop} />,
      store,
    );

    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveFocus();
  });

  it(`should emit ${renameEventName} when submitting the new name`, async () => {
    const { user } = setupWithJotaiProvider(
      <FileExplorer fileExplorerEntry={folderEntry} selectedFiles={[]} onFileClick={noop} />,
      store,
    );

    await user.keyboard('File 2{Enter}');
    expect(emitEvent).toHaveBeenCalledTimes(1);
    expect(emitEvent).toHaveBeenCalledWith<
      ['refstudio://explorer/rename', RefStudioEventPayload<'refstudio://explorer/rename'>]
    >('refstudio://explorer/rename', { path: fileEntry.path, newName: 'File 2.pdf' });
  });

  it(`should not emit ${renameEventName} when a file with the same name already exists`, async () => {
    const file2 = makeFileExplorerFileEntry('File 2.pdf');
    const { folderEntry: root } = makeFileExplorerFolderEntry('', [fileEntry, file2], true);

    store.set(fileExplorerEntryPathBeingRenamed, fileEntry.path);

    const { user } = setupWithJotaiProvider(
      <FileExplorer fileExplorerEntry={root} selectedFiles={[]} onFileClick={noop} />,
      store,
    );

    await user.keyboard('File 2{Enter}');
    expect(emitEvent).not.toHaveBeenCalled();
  });

  it(`should not emit ${renameEventName} when the name starts with a '.'`, async () => {
    const { user } = setupWithJotaiProvider(
      <FileExplorer fileExplorerEntry={folderEntry} selectedFiles={[]} onFileClick={noop} />,
      store,
    );

    await user.keyboard('.File 2{Enter}');
    expect(emitEvent).not.toHaveBeenCalled();
  });

  it(`should not emit ${renameEventName} when the name starts with a '.'`, async () => {
    const { user } = setupWithJotaiProvider(
      <FileExplorer fileExplorerEntry={folderEntry} selectedFiles={[]} onFileClick={noop} />,
      store,
    );

    await user.keyboard('.File 2{Enter}');
    expect(emitEvent).not.toHaveBeenCalled();
  });

  it(`should not emit ${renameEventName} when the name contains with a '/'`, async () => {
    const { user } = setupWithJotaiProvider(
      <FileExplorer fileExplorerEntry={folderEntry} selectedFiles={[]} onFileClick={noop} />,
      store,
    );

    await user.keyboard('invalid/name{Enter}');
    expect(emitEvent).not.toHaveBeenCalled();
  });

  it('should remove the input element when pressing Escape', async () => {
    const { user } = setupWithJotaiProvider(
      <FileExplorer fileExplorerEntry={folderEntry} selectedFiles={[]} onFileClick={noop} />,
      store,
    );

    await user.keyboard('{Escape}');
    expect(store.get(fileExplorerEntryPathBeingRenamed)).toBeNull();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('should remove the input element when unfocusing', async () => {
    const { user } = setupWithJotaiProvider(
      <FileExplorer fileExplorerEntry={folderEntry} selectedFiles={[]} onFileClick={noop} />,
      store,
    );

    await user.tab();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
