import { render, screen, userEvent, within } from '../test/test-utils';
import { TabPane } from './TabPane';

describe('TabPane component', () => {
  it('should render the one tab', () => {
    render(<TabPane items={[{ value: '1', text: 'File 1.txt' }]} value="1" onClick={() => 0} onCloseClick={() => 1} />);
    expect(screen.getByText('File 1.txt')).toBeInTheDocument();
  });

  it('should render the two tabs', () => {
    render(
      <TabPane
        items={[
          { value: '1', text: 'File 1.txt' },
          { value: '2', text: 'File 2.txt' },
        ]}
        value="1"
        onClick={() => 0}
        onCloseClick={() => 1}
      />,
    );
    expect(screen.getByText('File 1.txt')).toBeInTheDocument();
    expect(screen.getByText('File 2.txt')).toBeInTheDocument();
  });

  it('should render aria tablist with two aria tabs, one selected', () => {
    render(
      <TabPane
        items={[
          { value: '1', text: 'File 1.txt' },
          { value: '2', text: 'File 2.txt' },
        ]}
        value="1"
        onClick={() => 0}
        onCloseClick={() => 1}
      />,
    );
    expect(screen.getAllByRole('tablist').length).toBe(1);
    expect(screen.getAllByRole('tab').length).toBe(2);
    expect(screen.getByRole('tab', { selected: true, name: 'File 1.txt' })).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <TabPane
        items={[
          { value: '1', text: 'File 1.txt' },
          { value: '2', text: 'File 2.txt' },
        ]}
        value="1"
        onClick={onClick}
        onCloseClick={() => 1}
      />,
    );

    expect(onClick).not.toBeCalled();

    const inactive = screen.getByRole('tab', { selected: false });
    await user.click(inactive);

    expect(onClick).toBeCalled();
  });

  it('should call onCloseClick when X is clicked (and no call to onClick)', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onCloseClick = vi.fn();
    render(
      <TabPane
        items={[
          { value: '1', text: 'File 1.txt' },
          { value: '2', text: 'File 2.txt' },
        ]}
        value="1"
        onClick={onClick}
        onCloseClick={onCloseClick}
      />,
    );
    expect(onClick).not.toBeCalled();
    expect(onCloseClick).not.toBeCalled();

    const inactive = screen.getByRole('tab', { selected: false });
    const closeButton = within(inactive).getByRole('button');
    await user.click(closeButton);

    expect(onClick).not.toBeCalled();
    expect(onCloseClick).toBeCalled();
  });
});

// ########################################################################
// Use the following to debug:
//    - debug: output HTML
//    - logTestingPlaygroundURL: URL for testing playground
// ########################################################################
//
// screen.debug();
// screen.debug(screen.getByText('test'));
// screen.logTestingPlaygroundURL();
//
