import { useAtomValue } from 'jotai';
import { createRef, useCallback, useEffect, useState } from 'react';
import {
  VscBell,
  VscBellDot,
  VscChevronDown,
  VscChevronRight,
  VscClearAll,
  VscError,
  VscInfo,
  VscWarning,
} from 'react-icons/vsc';
import { useOnClickOutside } from 'usehooks-ts';

import { listNotificationsAtom, notificationsTypeStatsAtom } from '../../atoms/notificationsState';
import { FooterItem } from '../../components/footer/FooterItem';
import { emitEvent } from '../../events';
import { cx } from '../../lib/cx';
import { NotificationItem, NotificationItemType } from '../types';

export function FooterNotificationsItem() {
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

  return (
    <>
      <FooterItem
        hidden={stats.info === 0}
        icon={<VscInfo />}
        text={`${stats.info}`}
        onClick={() => togglePopup('info')}
      />
      <FooterItem
        hidden={stats.warning === 0}
        icon={<VscWarning />}
        text={`${stats.warning}`}
        onClick={() => togglePopup('warning')}
      />
      <FooterItem
        hidden={stats.error === 0}
        icon={<VscError />}
        text={`${stats.error}`}
        onClick={() => togglePopup('error')}
      />
      <FooterItem
        className={cx({ ' !bg-red-500 !text-white': stats.error > 0 })}
        icon={notifications.length > 0 ? <VscBellDot /> : <VscBell />}
        text=""
        onClick={() => togglePopup(undefined)}
      />
      {popupVisible && (
        <NotificationsPopup
          notifications={notifications}
          type={popupFilter}
          onClear={(type) => {
            emitEvent('refstudio://notifications/clear', { type });
            setPopupVisible(false);
          }}
          onClose={() => setPopupVisible(false)}
        />
      )}
    </>
  );
}

function NotificationsPopup({
  notifications,
  type,
  onClear,
  onClose,
}: {
  notifications: readonly Readonly<NotificationItem>[];
  type?: NotificationItemType;
  onClear: (type?: NotificationItemType) => void;
  onClose: () => void;
}) {
  const ref = createRef<HTMLDivElement>();
  useOnClickOutside(ref, onClose);

  return (
    <div className="absolute bottom-8 right-0 flex min-w-[600px] max-w-[200px]  flex-col bg-slate-800" ref={ref}>
      <div className="flex justify-between bg-black p-2">
        <strong className="uppercase">
          {notifications.length > 0 && <span>{type ?? 'ALL'} NOTIFICATIONS</span>}
          {notifications.length === 0 && <span>NO NEW NOTIFICATIONS</span>}
        </strong>
        <VscClearAll className="cursor-pointer" size={20} onClick={() => onClear(type)} />
      </div>
      <div className="flex max-h-[600px] flex-col divide-y divide-slate-600 overflow-auto">
        {notifications
          .filter((n) => !type || n.type === type)
          .map((notif) => (
            <NotificationItemWidget expanded={notif === notifications[0]} item={notif} key={notif.id} />
          ))}
      </div>
    </div>
  );
}

function NotificationItemWidget({ item, expanded }: { item: Readonly<NotificationItem>; expanded?: boolean }) {
  const [showDetails, setShowDetails] = useState(expanded);
  useEffect(() => {
    setShowDetails(expanded);
  }, [expanded]);
  const hasDetails = !!item.details;
  const date = new Date(item.when);
  return (
    <div className="flex flex-col px-2 py-2 hover:bg-slate-900/50">
      <div
        className={cx('flex items-center gap-2', {
          'cursor-pointer': hasDetails, //
        })}
        onClick={() => setShowDetails(!showDetails)}
      >
        <NotificationIcon type={item.type} />
        <span className="font-mono">
          {date.toLocaleTimeString()}
          <span className="text-xs">.{date.getMilliseconds()}</span>
        </span>
        <span className="truncate">{item.title}</span>
        {hasDetails && (
          <span className="ml-auto">
            {!showDetails && <VscChevronRight size={20} />}
            {showDetails && <VscChevronDown size={20} />}
          </span>
        )}
      </div>
      {showDetails && hasDetails && (
        <pre className="max-h-[200px] overflow-auto bg-slate-900/75 p-2 text-sm">{item.details}</pre>
      )}
    </div>
  );
}

function NotificationIcon({ type }: { type: NotificationItemType }) {
  switch (type) {
    case 'info':
      return <VscInfo className="text-blue-400" size={20} />;
    case 'warning':
      return <VscWarning className="text-orange-400" size={20} />;
    case 'error':
      return <VscError className="text-red-400" size={20} />;
  }
}
