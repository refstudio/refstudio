import { useState } from 'react';

import { useListenEvent } from '../hooks/useListenEvent';
import { SettingsModal } from './SettingsModal';

export function SettingsModalOpener() {
  const [open, setOpen] = useState(false);

  useListenEvent('refstudio://menu/settings', () => setOpen((curr) => !curr));

  if (!open) {
    return null;
  }

  return <SettingsModal open={open} onClose={() => setOpen(false)} />;
}
