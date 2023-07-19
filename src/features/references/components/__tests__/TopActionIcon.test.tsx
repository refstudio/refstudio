import { VscAdd } from 'react-icons/vsc';

import { screen, setupWithJotaiProvider } from '../../../../test/test-utils';
import { TopActionIcon } from '../TopActionIcon';

describe('TopActionIcon', () => {
  it('should display action text', () => {
    setupWithJotaiProvider(<TopActionIcon action="ACTION" icon={VscAdd} />);
    expect(screen.getByText(/ACTION/i)).toBeInTheDocument();
  });

  it('should display counter after action text', () => {
    setupWithJotaiProvider(<TopActionIcon action="ACTION" icon={VscAdd} selectedCount={10} />);
    expect(screen.getByText(/10/)).toBeInTheDocument();
  });

  it('should trigger onClick on click', async () => {
    const handler = vi.fn();
    const { user } = setupWithJotaiProvider(<TopActionIcon action="ACTION" icon={VscAdd} onClick={handler} />);
    await user.click(screen.getByText(/ACTION/));
    expect(handler).toHaveBeenCalled();
  });

  it('should NOT trigger onClick on click when disabled', async () => {
    const handler = vi.fn();
    const { user } = setupWithJotaiProvider(<TopActionIcon action="ACTION" disabled icon={VscAdd} onClick={handler} />);
    expect(screen.getByText(/ACTION/)).toHaveClass('pointer-events-none');
    expect(screen.getByText(/ACTION/)).toHaveAttribute('aria-disabled', 'true');
    await user.click(screen.getByText(/ACTION/));
    expect(handler).toHaveBeenCalledTimes(0);
  });
});
