import { useState } from 'react';

import { RefStudioEvents } from '../events';
import { useListenEvent } from '../hooks/useListenEvent';
import { SettingsModal } from './SettingsModal';

export function SettingsModalOpener() {
  const [open, setOpen] = useState(false);

  useListenEvent(RefStudioEvents.menu.settings, () => setOpen((curr) => !curr));

  if (!open) {
    return null;
  }

  return <SettingsModal open={open} onCloseClick={() => setOpen(false)} />;
}
