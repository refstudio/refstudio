import { createStore } from 'jotai';

import { addNotificationAtom } from '../../../atoms/notificationsState';
import { screen, setupWithJotaiProvider, within } from '../../../test/test-utils';
import { clearNotifications } from '../../notifications';
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

    expect(screen.getByTestId(NotificationsPopup.name)).toBeInTheDocument();
  });

  it('should display notifications popup on click - infos', async () => {
    store.set(addNotificationAtom, 'info', 'Title INFO 1');
    store.set(addNotificationAtom, 'info', 'Title INFO 2');
    const { user } = setupWithJotaiProvider(<FooterNotificationItems />, store);
    await user.click(screen.getByRole('listitem', { name: 'infos' }));
    expect(screen.getByTestId(NotificationsPopup.name)).toBeInTheDocument();
  });

  it('should display notifications popup on click - warnings', async () => {
    store.set(addNotificationAtom, 'warning', 'Title warning 1');
    store.set(addNotificationAtom, 'warning', 'Title warning 2');
    const { user } = setupWithJotaiProvider(<FooterNotificationItems />, store);
    await user.click(screen.getByRole('listitem', { name: 'warnings' }));
    expect(screen.getByTestId(NotificationsPopup.name)).toBeInTheDocument();
  });

  it('should display notifications popup on click - errors', async () => {
    store.set(addNotificationAtom, 'error', 'Title error 1');
    store.set(addNotificationAtom, 'error', 'Title error 2');
    const { user } = setupWithJotaiProvider(<FooterNotificationItems />, store);
    await user.click(screen.getByRole('listitem', { name: 'errors' }));
    expect(screen.getByTestId(NotificationsPopup.name)).toBeInTheDocument();
  });

  it('should display empty notifications popup on click', async () => {
    const { user } = setupWithJotaiProvider(<FooterNotificationItems />, store);
    await user.click(screen.getByRole('listitem', { name: 'notifications' }));
    expect(screen.getByTestId(NotificationsPopup.name)).toBeInTheDocument();
    expect(screen.getByText('NO NEW NOTIFICATIONS')).toBeInTheDocument();
  });

  it('should display all notifications in notifications popup', async () => {
    store.set(addNotificationAtom, 'info', 'Title INFO 1');
    store.set(addNotificationAtom, 'info', 'Title INFO 2');
    store.set(addNotificationAtom, 'warning', 'Title warning 1');
    store.set(addNotificationAtom, 'warning', 'Title warning 2');
    store.set(addNotificationAtom, 'warning', 'Title warning 3');
    store.set(addNotificationAtom, 'error', 'Title error 1');
    const { user } = setupWithJotaiProvider(<FooterNotificationItems />, store);

    await user.click(screen.getByRole('listitem', { name: 'notifications' }));
    const notificationsPopup = screen.getByTestId(NotificationsPopup.name);
    expect(within(notificationsPopup).getAllByRole('row')).toHaveLength(6);
  });

  it('should only expand first notification item by default', () => {
    store.set(addNotificationAtom, 'error', 'Error Title 1', 'Details message 1');
    store.set(addNotificationAtom, 'error', 'Error Title 2', 'Details message 2');
    setupWithJotaiProvider(<FooterNotificationItems />, store);

    const notificationsPopup = screen.getByTestId(NotificationsPopup.name);
    const [itemA, itemB] = within(notificationsPopup).getAllByRole('row');
    expect(within(itemA).getByText('Error Title 2')).toBeInTheDocument();
    expect(within(itemA).getByText('Details message 2')).toBeInTheDocument();
    expect(within(itemB).getByText('Error Title 1')).toBeInTheDocument();
    expect(within(itemB).queryByText('Details message 1')).not.toBeInTheDocument();
  });

  it('should expand/close notification item by default', async () => {
    const ITEMS = [
      { type: 'info' as NotificationItemType, title: 'Info Title 1', details: 'Details message 1' },
      { type: 'info' as NotificationItemType, title: 'Info Title 2', details: 'Details message 2' },
      { type: 'info' as NotificationItemType, title: 'Info Title 3', details: 'Details message 3' },
    ];
    store.set(addNotificationAtom, ITEMS[0].type, ITEMS[0].title, ITEMS[0].details);
    store.set(addNotificationAtom, ITEMS[1].type, ITEMS[1].title, ITEMS[1].details);
    store.set(addNotificationAtom, ITEMS[2].type, ITEMS[2].title, ITEMS[2].details);
    const { user } = setupWithJotaiProvider(<FooterNotificationItems />, store);
    await user.click(screen.getByRole('listitem', { name: 'notifications' }));

    const notificationsPopup = screen.getByTestId(NotificationsPopup.name);

    const getItems = (params: { isExpanded: boolean }) =>
      within(notificationsPopup).queryAllByRole('row', { expanded: params.isExpanded });

    const clickOnElement = async (element: HTMLElement) => {
      expect(element.querySelector('.cursor-pointer')).toBeDefined();
      await user.click(element.querySelector('.cursor-pointer')!);
    };

    // 1 expanded, and 2 colapsed
    expect(getItems({ isExpanded: true })).toHaveLength(1);
    expect(getItems({ isExpanded: false })).toHaveLength(2);

    // Collapse
    const [firstExpanded] = getItems({ isExpanded: true });
    await clickOnElement(firstExpanded);

    // 0 expanded and 3 collapsed
    expect(getItems({ isExpanded: true })).toHaveLength(0);
    expect(getItems({ isExpanded: false })).toHaveLength(3);

    // Expand all
    const items = getItems({ isExpanded: false });
    await clickOnElement(items[0]);
    await clickOnElement(items[1]);
    await clickOnElement(items[2]);

    // 3 expanded and 0 collapsed
    expect(getItems({ isExpanded: true })).toHaveLength(3);
    expect(getItems({ isExpanded: false })).toHaveLength(0);
  });

  it('should call clearNotifications and close on CLEAR ALL click', async () => {
    const ITEMS = [
      { type: 'info' as NotificationItemType, title: 'Info Title 1', details: 'Details message 1' },
      { type: 'info' as NotificationItemType, title: 'Info Title 2', details: 'Details message 2' },
      { type: 'info' as NotificationItemType, title: 'Info Title 3', details: 'Details message 3' },
    ];
    store.set(addNotificationAtom, ITEMS[0].type, ITEMS[0].title, ITEMS[0].details);
    store.set(addNotificationAtom, ITEMS[1].type, ITEMS[1].title, ITEMS[1].details);
    store.set(addNotificationAtom, ITEMS[2].type, ITEMS[2].title, ITEMS[2].details);
    const { user } = setupWithJotaiProvider(<FooterNotificationItems />, store);
    await user.click(screen.getByRole('listitem', { name: 'notifications' }));
    expect(screen.getByTestId(NotificationsPopup.name)).toBeInTheDocument();

    await user.click(screen.getByTitle('Clear All'));

    expect(screen.queryByTestId(NotificationsPopup.name)).not.toBeInTheDocument();
    expect(clearNotifications).toHaveBeenCalledWith(undefined);
  });
});
