import { noop } from '../../../lib/noop';
import { render, screen, setup } from '../../../test/test-utils';
import { NotificationItem } from '../../types';
import { NotificationsPopup } from '../NotificationsPopup';

describe('NotificationsPopup', () => {
  const when = new Date().toISOString();
  let id = 1;
  const NOTIFICATIONS: readonly NotificationItem[] = [
    { id: String(id++), when, type: 'info', title: 'Title INFO 1', details: 'Some details for Title INFO 1' },
    { id: String(id++), when, type: 'info', title: 'Title INFO 2', details: 'Some details for Title INFO 2' },
    { id: String(id++), when, type: 'warning', title: 'Title warning 1', details: 'Some details for Title warning 1' },
    { id: String(id++), when, type: 'warning', title: 'Title warning 2', details: 'Some details for Title warning 2' },
    { id: String(id++), when, type: 'warning', title: 'Title warning 3', details: 'Some details for Title warning 3' },
    { id: String(id++), when, type: 'error', title: 'Title error 1', details: 'Some details for Title error 1' },
  ];

  it('should display empty notifications popup', () => {
    render(<NotificationsPopup notifications={[]} onClear={noop} />);
    expect(screen.getByText('NO NEW NOTIFICATIONS')).toBeInTheDocument();
  });

  it('should display all notifications in notifications popup', () => {
    setup(<NotificationsPopup notifications={NOTIFICATIONS} onClear={noop} />);
    expect(screen.getAllByRole('row')).toHaveLength(NOTIFICATIONS.length);
  });

  it('should only expand first notification item by default', () => {
    render(<NotificationsPopup notifications={NOTIFICATIONS} onClear={noop} />);

    expect(screen.getByRole('row', { expanded: true })).toBeInTheDocument();
    expect(screen.queryAllByRole('row', { expanded: false })).toHaveLength(NOTIFICATIONS.length - 1);
    expect(screen.getByRole('row', { expanded: true })).toHaveAttribute('title', NOTIFICATIONS[0].title);
  });

  it('should expand/close notification item by default', async () => {
    const { user } = setup(<NotificationsPopup notifications={NOTIFICATIONS} onClear={noop} />);

    const getItems = (params: { isExpanded: boolean }) => screen.queryAllByRole('row', { expanded: params.isExpanded });

    const clickOnElement = async (element: HTMLElement) => {
      expect(element.querySelector('.cursor-pointer')).toBeDefined();
      await user.click(element.querySelector('.cursor-pointer')!);
    };

    // 1 expanded, and N+1 colapsed
    expect(getItems({ isExpanded: true })).toHaveLength(1);
    expect(getItems({ isExpanded: false })).toHaveLength(NOTIFICATIONS.length - 1);

    // Collapse first
    const [firstExpanded] = getItems({ isExpanded: true });
    await clickOnElement(firstExpanded);

    // 0 expanded and N collapsed
    expect(getItems({ isExpanded: true })).toHaveLength(0);
    expect(getItems({ isExpanded: false })).toHaveLength(NOTIFICATIONS.length);

    // Expand all
    const items = getItems({ isExpanded: false });
    await Promise.all(items.map(clickOnElement));

    // N expanded and 0 collapsed
    expect(getItems({ isExpanded: true })).toHaveLength(NOTIFICATIONS.length);
    expect(getItems({ isExpanded: false })).toHaveLength(0);
  });

  it('should call clearNotifications and close on CLEAR ALL click', async () => {
    const fn = vi.fn();
    const { user } = setup(<NotificationsPopup notifications={NOTIFICATIONS} onClear={fn} />);

    await user.click(screen.getByTitle('Clear All'));

    expect(fn).toHaveBeenCalled();
  });
});
