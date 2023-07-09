import { useAtomValue } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import { VscBell, VscBellDot, VscError, VscInfo, VscWarning } from 'react-icons/vsc';

import { listNotificationsAtom, notificationsTypeStatsAtom } from '../../atoms/notificationsState';
import { FooterItem } from '../../components/footer/FooterItem';
import { cx } from '../../lib/cx';
import { clearNotifications } from '../notifications';
import { NotificationItemType } from '../types';
import { NotificationsPopup } from './NotificationsPopup';

export function FooterNotificationItems() {
  const [popupFilter, setPopupFilter] = useState<NotificationItemType>();
  const [popupVisible, setPopupVisible] = useState(false);

  const notifications = useAtomValue(listNotificationsAtom);
  const stats = useAtomValue(notificationsTypeStatsAtom);

  const togglePopup = useCallback(
    (filter?: NotificationItemType) => {
      setPopupFilter(filter);
      setPopupVisible(true);
    },
    [setPopupFilter, setPopupVisible],
  );

  useEffect(() => {
    if (notifications.length > 0 && notifications[0].type === 'error') {
      setPopupFilter('error');
      setPopupVisible(true);
    }
  }, [notifications]);

  return (
    <>
      <FooterItem
        hidden={stats.info === 0}
        icon={<VscInfo />}
        text={stats.info}
        title="infos"
        onClick={() => togglePopup('info')}
      />
      <FooterItem
        hidden={stats.warning === 0}
        icon={<VscWarning />}
        text={stats.warning}
        title="warnings"
        onClick={() => togglePopup('warning')}
      />
      <FooterItem
        hidden={stats.error === 0}
        icon={<VscError />}
        text={stats.error}
        title="errors"
        onClick={() => togglePopup('error')}
      />
      <FooterItem
        className={cx({ ' !bg-red-500 !text-white': stats.error > 0 })}
        icon={notifications.length > 0 ? <VscBellDot /> : <VscBell />}
        title="notifications"
        onClick={() => togglePopup(undefined)}
      />
      {popupVisible && (
        <NotificationsPopup
          notifications={notifications}
          type={popupFilter}
          onClear={(type) => {
            clearNotifications(type);
            setPopupVisible(false);
          }}
          onClose={() => setPopupVisible(false)}
        />
      )}
    </>
  );
}
