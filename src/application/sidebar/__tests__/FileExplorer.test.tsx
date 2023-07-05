import { makeFileExplorerFileEntry, makeFileExplorerFolderEntry } from '../../../atoms/__tests__/test-fixtures';
import { FileExplorerFileEntry, FileExplorerFolderEntry } from '../../../atoms/types/FileExplorerEntry';
import { noop } from '../../../lib/noop';
import { act, render, screen, setup } from '../../../test/test-utils';
import { FileExplorer } from '../FileExplorer';

describe('FileExplorer', () => {
  let fileEntry: FileExplorerFileEntry;
  let folderEntry: FileExplorerFolderEntry;
  beforeEach(() => {
    vi.clearAllMocks();

    fileEntry = makeFileExplorerFileEntry('File 1.pdf');
    folderEntry = makeFileExplorerFolderEntry('root', [fileEntry], true).folderEntry;
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

    const { user } = setup(<FileExplorer fileExplorerEntry={folder} selectedFiles={[]} onFileClick={noop} />);
    expect(screen.getByText(folder.name)).toBeInTheDocument();

    // Folder is collapsed by default
    expect(screen.queryByText(file.name)).not.toBeInTheDocument();
    await act(async () => {
      await user.click(screen.getByText(folder.name));
    });
    expect(screen.getByText(file.name)).toBeInTheDocument();
  });
});
