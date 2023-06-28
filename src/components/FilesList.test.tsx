import { VscFile } from 'react-icons/vsc';

import { makeFile } from '../atoms/test-fixtures';
import { noop } from '../lib/noop';
import { render, screen, setup } from '../test/test-utils';
import { RightAction } from './FileNode';
import { FilesList } from './FilesList';

describe('FilesList component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render a file', () => {
    const { fileData } = makeFile('File 1.pdf');
    render(<FilesList files={[fileData]} selectedFiles={[]} onClick={noop} />);
    expect(screen.getByText(fileData.fileName)).toBeInTheDocument();
  });

  it('should call onClick with file id', async () => {
    const { fileData } = makeFile('File 1.pdf');
    const onClick = vi.fn();
    const { user } = setup(<FilesList files={[fileData]} selectedFiles={[]} onClick={onClick} />);

    await user.click(screen.getByText(fileData.fileName));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(fileData.fileId);
  });

  it('should render several files', () => {
    const { fileData: fileData1 } = makeFile('File 1.pdf');
    const { fileData: fileData2 } = makeFile('File 2.pdf');
    render(<FilesList files={[fileData1, fileData2]} selectedFiles={[]} onClick={noop} />);
    expect(screen.getByText(fileData1.fileName)).toBeInTheDocument();
    expect(screen.getByText(fileData2.fileName)).toBeInTheDocument();
  });

  it('should call rightAction with file id', () => {
    const { fileData } = makeFile('File 1.pdf');
    const rightActionMock = vi.fn<[], RightAction>().mockReturnValue({ onClick: vi.fn(), VscIcon: VscFile });

    render(<FilesList files={[fileData]} rightAction={rightActionMock} selectedFiles={[]} onClick={noop} />);

    expect(rightActionMock).toHaveBeenCalledTimes(1);
    expect(rightActionMock).toHaveBeenCalledWith(fileData.fileId);

    expect(screen.getByRole('button', { hidden: true })).toBeInTheDocument();
  });
});
