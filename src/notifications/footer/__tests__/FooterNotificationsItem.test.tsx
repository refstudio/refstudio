import { createStore } from 'jotai';

import { addNotificationAtom, notificationsPopupAtom } from '../../../atoms/notificationsState';
import { screen, setupWithJotaiProvider, within } from '../../../test/test-utils';
import { clearNotifications, hideNotifications, showNotifications } from '../../notifications';
import { NotificationItemType } from '../../types';
import { FooterNotificationItems } from '../FooterNotificationItems';
import { NotificationsPopup } from '../NotificationsPopup';

vi.mock('../../notifications');

describe('FooterNotificationsItem', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should display only one icon without notifications', () => {
    setupWithJotaiProvider(<FooterNotificationItems />, store);
    expect(screen.getByRole('listitem', { name: 'notifications' })).toBeInTheDocument();
  });

  it('should display one icon per notification type and counters', () => {
    store.set(addNotificationAtom, 'info', 'Title INFO');
    store.set(addNotificationAtom, 'warning', 'Title WARNING');
    store.set(addNotificationAtom, 'error', 'Title ERROR');
    setupWithJotaiProvider(<FooterNotificationItems />, store);

    expect(within(screen.getByRole('listitem', { name: 'infos' })).getByText('1')).toBeInTheDocument();
    expect(within(screen.getByRole('listitem', { name: 'warnings' })).getByText('1')).toBeInTheDocument();
    expect(within(screen.getByRole('listitem', { name: 'errors' })).getByText('1')).toBeInTheDocument();
  });

  it('should hide notifications popup if last notification is NOT ERROR', () => {
    store.set(addNotificationAtom, 'info', 'Title INFO 1');
    store.set(addNotificationAtom, 'info', 'Title INFO 2');
    setupWithJotaiProvider(<FooterNotificationItems />, store);

    expect(screen.queryByTestId(NotificationsPopup.name)).not.toBeInTheDocument();
  });

  it('should display notifications popup if last notification is ERROR', () => {
    store.set(addNotificationAtom, 'info', 'Title INFO 1');
    store.set(addNotificationAtom, 'info', 'Title INFO 2');
    store.set(addNotificationAtom, 'error', 'Title ERROR 1');
    setupWithJotaiProvider(<FooterNotificationItems />, store);
    expect(showNotifications).toHaveBeenCalledWith('error');
  });

  it('should display notifications popup on click - infos', async () => {
    store.set(addNotificationAtom, 'info', 'Title INFO 1');
    store.set(addNotificationAtom, 'info', 'Title INFO 2');
    const { user } = setupWithJotaiProvider(<FooterNotificationItems />, store);
    await user.click(screen.getByRole('listitem', { name: 'infos' }));
    expect(showNotifications).toHaveBeenCalledWith('info');
  });

  it('should display notifications popup on click - warnings', async () => {
    store.set(addNotificationAtom, 'warning', 'Title warning 1');
    store.set(addNotificationAtom, 'warning', 'Title warning 2');
    const { user } = setupWithJotaiProvider(<FooterNotificationItems />, store);
    await user.click(screen.getByRole('listitem', { name: 'warnings' }));
    expect(showNotifications).toHaveBeenCalledWith('warning');
  });

  it('should display notifications popup on click - errors', async () => {
    store.set(addNotificationAtom, 'error', 'Title error 1');
    store.set(addNotificationAtom, 'error', 'Title error 2');
    const { user } = setupWithJotaiProvider(<FooterNotificationItems />, store);
    await user.click(screen.getByRole('listitem', { name: 'errors' }));
    expect(showNotifications).toHaveBeenCalledWith('error');
  });

  it('should keep notifications popup open if clicked on different type', async () => {
    store.set(addNotificationAtom, 'error', 'Title error 1');
    store.set(addNotificationAtom, 'error', 'Title error 2');
    store.set(addNotificationAtom, 'warning', 'Title warning 1');
    store.set(addNotificationAtom, 'warning', 'Title warning 2');
    store.set(notificationsPopupAtom, { open: true, type: 'error' });
    const { user } = setupWithJotaiProvider(<FooterNotificationItems />, store);
    await user.click(screen.getByRole('listitem', { name: 'notifications' }));
    expect(showNotifications).toHaveBeenCalledWith(undefined);
  });

  it('should close notifications popup open if already opened with same type', async () => {
    store.set(addNotificationAtom, 'info', 'Title info 1');
    store.set(notificationsPopupAtom, { open: true, type: 'info' });
    const { user } = setupWithJotaiProvider(<FooterNotificationItems />, store);
    const footerItem = screen.getByRole('listitem', { name: 'infos' });
    await user.click(footerItem);
    expect(hideNotifications).toHaveBeenCalled();
  });

  it('should display notifications popup on store open', () => {
    store.set(addNotificationAtom, 'error', 'Title error 1');
    store.set(addNotificationAtom, 'error', 'Title error 2');
    store.set(notificationsPopupAtom, { open: true });
    setupWithJotaiProvider(<FooterNotificationItems />, store);
    expect(screen.getByTestId(NotificationsPopup.name)).toBeInTheDocument();
  });

  it('should call clearNotifications and hideNotifications on CLEAR ALL click', async () => {
    const ITEMS = [
      { type: 'info' as NotificationItemType, title: 'Info Title 1', details: 'Details message 1' },
      { type: 'info' as NotificationItemType, title: 'Info Title 2', details: 'Details message 2' },
      { type: 'info' as NotificationItemType, title: 'Info Title 3', details: 'Details message 3' },
    ];
    ITEMS.forEach((item) => store.set(addNotificationAtom, item.type, item.title, item.details));
    store.set(notificationsPopupAtom, { open: true });

    const { user } = setupWithJotaiProvider(<FooterNotificationItems />, store);
    await user.click(screen.getByTitle('Clear All'));

    expect(clearNotifications).toHaveBeenCalled();
    expect(hideNotifications).toHaveBeenCalled();
  });
});
