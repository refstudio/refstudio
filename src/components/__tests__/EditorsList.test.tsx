import { VscFile } from 'react-icons/vsc';

import { makeFile } from '../../atoms/test-fixtures';
import { noop } from '../../lib/noop';
import { render, screen, setup } from '../../test/test-utils';
import { EditorsList } from '../EditorsList';
import { RightAction } from '../FileNode';

describe('EditorsList component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render a editor', () => {
    const { editorData } = makeFile('File 1.pdf');
    render(<EditorsList editors={[editorData]} selectedEditors={[]} onClick={noop} />);
    expect(screen.getByText(editorData.title)).toBeInTheDocument();
  });

  it('should call onClick with file id', async () => {
    const { editorData } = makeFile('File 1.pdf');
    const onClick = vi.fn();
    const { user } = setup(<EditorsList editors={[editorData]} selectedEditors={[]} onClick={onClick} />);

    await user.click(screen.getByText(editorData.title));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(editorData.id);
  });

  it('should render several files', () => {
    const { editorData: editorData1 } = makeFile('File 1.pdf');
    const { editorData: editorData2 } = makeFile('File 2.pdf');
    render(<EditorsList editors={[editorData1, editorData2]} selectedEditors={[]} onClick={noop} />);
    expect(screen.getByText(editorData1.title)).toBeInTheDocument();
    expect(screen.getByText(editorData2.title)).toBeInTheDocument();
  });

  it('should call rightAction with file id', () => {
    const { editorData } = makeFile('File 1.pdf');
    const rightActionMock = vi.fn<[], RightAction>().mockReturnValue({ onClick: vi.fn(), VscIcon: VscFile });

    render(<EditorsList editors={[editorData]} rightAction={rightActionMock} selectedEditors={[]} onClick={noop} />);

    expect(rightActionMock).toHaveBeenCalledTimes(1);
    expect(rightActionMock).toHaveBeenCalledWith(editorData.id);

    expect(screen.getByRole('button', { hidden: true })).toBeInTheDocument();
  });
});
