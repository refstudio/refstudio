import { makeFile, makeFolder } from '../../atoms/__tests__/test-fixtures';
import { noop } from '../../lib/noop';
import { act, render, screen, setup } from '../../test/test-utils';
import { FileEntryTree } from '../FileEntryTree';

describe('FileEntryTree component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render a file', () => {
    const { fileEntry } = makeFile('File 1.pdf');
    render(<FileEntryTree files={[fileEntry]} root selectedFiles={[]} onFileClick={noop} />);
    expect(screen.getByText(fileEntry.name)).toBeInTheDocument();
  });

  it('should call onFileClick with file path', async () => {
    const { fileEntry } = makeFile('File 1.pdf');
    const onClick = vi.fn();
    const { user } = setup(<FileEntryTree files={[fileEntry]} root selectedFiles={[]} onFileClick={onClick} />);

    await user.click(screen.getByText(fileEntry.name));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(fileEntry.path);
  });

  it('should render a folder and its children', async () => {
    const { fileEntry } = makeFile('File 1.pdf');
    const folderEntry = makeFolder('Folder 1', [fileEntry]);
    const { user } = setup(<FileEntryTree files={[folderEntry]} root selectedFiles={[]} onFileClick={noop} />);
    expect(screen.getByText(folderEntry.name)).toBeInTheDocument();

    // Folder is collapsed by default
    expect(screen.queryByText(fileEntry.name)).not.toBeInTheDocument();
    await act(async () => {
      await user.click(screen.getByText(folderEntry.name));
    });
    expect(screen.getByText(fileEntry.name)).toBeInTheDocument();
  });

  it('should not render dotfiles', () => {
    const { fileEntry } = makeFile('File 1.pdf');
    const { fileEntry: dotfileFileEntry } = makeFile('.file2');
    render(<FileEntryTree files={[fileEntry, dotfileFileEntry]} root selectedFiles={[]} onFileClick={noop} />);
    expect(screen.getByText(fileEntry.name)).toBeInTheDocument();
    expect(screen.queryByText(dotfileFileEntry.name)).not.toBeInTheDocument();
  });
});
