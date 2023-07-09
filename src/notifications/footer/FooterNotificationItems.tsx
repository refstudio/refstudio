import { useAtomValue } from 'jotai';
import { useCallback, useEffect } from 'react';
import { VscBell, VscBellDot, VscError, VscInfo, VscWarning } from 'react-icons/vsc';

import {
  listNotificationsAtom,
  notificationsPopupAtom,
  notificationsTypeStatsAtom,
} from '../../atoms/notificationsState';
import { FooterItem } from '../../components/footer/FooterItem';
import { cx } from '../../lib/cx';
import { clearNotifications, hideNotifications, showNotifications } from '../notifications';
import { NotificationItemType } from '../types';
import { NotificationsPopup } from './NotificationsPopup';

export function FooterNotificationItems() {
  const notifications = useAtomValue(listNotificationsAtom);
  const stats = useAtomValue(notificationsTypeStatsAtom);

  const notificationsPopup = useAtomValue(notificationsPopupAtom);

  useEffect(() => {
    if (notifications.length > 0 && notifications[0].type === 'error') {
      showNotifications('error');
    }
  }, [notifications]);

  const onFooterItemClicked = useCallback(
    (type?: NotificationItemType) => {
      if (!notificationsPopup.open) {
        showNotifications(type);
      } else if (notificationsPopup.type !== type) {
        showNotifications(type);
      } else {
        hideNotifications();
      }
    },
    [notificationsPopup],
  );

  return (
    <>
      <FooterItem
        hidden={stats.info === 0}
        icon={<VscInfo />}
        text={stats.info}
        title="infos"
        onClick={() => onFooterItemClicked('info')}
      />
      <FooterItem
        hidden={stats.warning === 0}
        icon={<VscWarning />}
        text={stats.warning}
        title="warnings"
        onClick={() => onFooterItemClicked('warning')}
      />
      <FooterItem
        hidden={stats.error === 0}
        icon={<VscError />}
        text={stats.error}
        title="errors"
        onClick={() => onFooterItemClicked('error')}
      />
      <FooterItem
        className={cx({ ' !bg-red-500 !text-white': stats.error > 0 })}
        icon={notifications.length > 0 ? <VscBellDot /> : <VscBell />}
        title="notifications"
        onClick={() => onFooterItemClicked(undefined)}
      />
      {notificationsPopup.open && (
        <NotificationsPopup
          notifications={notifications}
          type={notificationsPopup.type}
          onClear={(type) => {
            clearNotifications(type);
            hideNotifications();
          }}
        />
      )}
    </>
  );
}
