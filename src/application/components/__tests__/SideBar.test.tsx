import { noop } from '../../../lib/noop';
import { render, screen, userEvent } from '../../../test/test-utils';
import { SideBar } from '../SideBar';

describe('SideBar', () => {
  it('should display Explorer and References icons', () => {
    const panes = [
      { pane: 'Explorer', Icon: <div data-testid="Explorer" /> },
      { pane: 'References', Icon: <div data-testid="References" /> },
    ];

    render(<SideBar activePane="Explorer" items={panes} onItemClick={noop} />);
    expect(screen.getByRole('menubar')).toBeInTheDocument();

    expect(screen.getByTestId('Explorer')).toBeInTheDocument();
    expect(screen.getByTestId('References')).toBeInTheDocument();
  });

  it('should display active icon', () => {
    const panes = [
      {
        pane: 'Explorer',
        Icon: <div data-testid="Explorer" />,
      },
      {
        pane: 'References',
        Icon: <div data-testid="References" />,
      },
    ];

    render(<SideBar activePane="References" items={panes} onItemClick={noop} />);
    expect(screen.getByRole('menubar')).toBeInTheDocument();
    expect(screen.getByTestId('Explorer').parentElement!.parentElement).not.toHaveClass('active');
    expect(screen.getByTestId('References').parentElement!.parentElement).toHaveClass('active');
  });

  it('should call onClick with pane name', async () => {
    const fn = vi.fn();
    const panes = [
      { pane: 'Explorer', Icon: <div data-testid="Explorer" /> },
      { pane: 'References', Icon: <div data-testid="References" /> },
    ];

    render(<SideBar activePane="References" items={panes} onItemClick={fn} />);
    await userEvent.setup().click(screen.getByTestId('Explorer'));
    expect(fn).toBeCalled();
    expect(fn).toBeCalledWith('Explorer');
  });

  it('should call onSettingsClick with click in the settings icon', async () => {
    const settingsFn = vi.fn();
    const panes = [
      { pane: 'Explorer', Icon: <div data-testid="Explorer" /> },
      { pane: 'References', Icon: <div data-testid="References" /> },
    ];
    const footerItems = [{ label: 'Settings', Icon: <div data-testid="Settings" />, onClick: settingsFn }];

    render(<SideBar activePane="References" footerItems={footerItems} items={panes} onItemClick={noop} />);
    await userEvent.setup().click(screen.getByTestId('Settings'));
    expect(settingsFn).toBeCalled();
  });
});
