import { useEffect, useState } from 'react';
import { VscChevronDown, VscChevronRight, VscClearAll, VscError, VscInfo, VscWarning } from 'react-icons/vsc';

import { cx } from '../../lib/cx';
import { NotificationItemType, ReadonlyNotificationItem } from '../types';

export function NotificationsPopup({
  notifications,
  type,
  onClear,
}: {
  notifications: readonly ReadonlyNotificationItem[];
  type?: NotificationItemType;
  onClear: (type?: NotificationItemType) => void;
}) {
  return (
    <div
      className="absolute bottom-8 right-0 flex min-w-[600px] max-w-[200px]  flex-col bg-slate-800"
      data-testid={NotificationsPopup.name}
    >
      <div className="flex justify-between bg-black p-2">
        <strong className="uppercase">
          {notifications.length > 0 && <span>{type ?? 'ALL'} NOTIFICATIONS</span>}
          {notifications.length === 0 && <span>NO NEW NOTIFICATIONS</span>}
        </strong>
        <VscClearAll className="cursor-pointer" size={20} title="Clear All" onClick={() => onClear(type)} />
      </div>
      <div className="flex max-h-[600px] flex-col divide-y divide-slate-600 overflow-auto" role="treegrid">
        {notifications
          .filter((n) => !type || n.type === type)
          .map((notif) => (
            <NotificationItemWidget expanded={notif === notifications[0]} item={notif} key={notif.id} />
          ))}
      </div>
    </div>
  );
}
function NotificationItemWidget({ item, expanded }: { item: Readonly<ReadonlyNotificationItem>; expanded?: boolean }) {
  const [showDetails, setShowDetails] = useState(expanded);
  useEffect(() => {
    setShowDetails(expanded);
  }, [expanded]);

  const hasDetails = !!item.details;
  const date = new Date(item.when);
  return (
    <div
      aria-expanded={showDetails}
      className="flex flex-col px-2 py-2 hover:bg-slate-900/50"
      role="row"
      title={item.title}
    >
      <div
        className={cx('flex items-center gap-2', {
          'cursor-pointer': hasDetails, //
        })}
        onClick={() => {
          const show = !showDetails;
          setShowDetails(show);
        }}
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
