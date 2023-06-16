import { render, screen, userEvent } from '../utils/test-utils';
import { PrimarySideBar } from './PrimarySideBar';

const noop = () => {
  // Empty
};

describe('PrimarySideBar', () => {
  test('should display Explorer and References icons', () => {
    render(<PrimarySideBar activePane="Explorer" onClick={noop} onSettingsClick={noop} />);
    expect(screen.getByRole('menubar')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Explorer' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'References' })).toBeInTheDocument();
  });

  test('should display active icon with 100% opacity ', () => {
    render(<PrimarySideBar activePane="References" onClick={noop} onSettingsClick={noop} />);
    expect(screen.getByRole('menubar')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'References' })).toHaveClass('opacity-100');
  });

  test('should display inactive icon with 50% opacity ', () => {
    render(<PrimarySideBar activePane="References" onClick={noop} onSettingsClick={noop} />);
    expect(screen.getByRole('menubar')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Explorer' })).toHaveClass('opacity-50');
  });

  test('should call onClick with pane name', async () => {
    const fn = vi.fn();
    render(<PrimarySideBar activePane="References" onClick={fn} onSettingsClick={noop} />);
    await userEvent.setup().click(screen.getByRole('menuitem', { name: 'Explorer' }));
    expect(fn).toBeCalled();
    expect(fn).toBeCalledWith('Explorer');
  });

  test('should call onSettingsClick with click in the settings icon', async () => {
    const settingsFn = vi.fn();
    render(<PrimarySideBar activePane="References" onClick={noop} onSettingsClick={settingsFn} />);
    await userEvent.setup().click(screen.getByRole('menuitem', { name: 'Settings' }));
    expect(settingsFn).toBeCalled();
  });
});
