import { useCallback, useState } from 'react';

import { listenEvent, RefStudioEvents } from '../events';
import { useAsyncEffect } from '../hooks/useAsyncEffect';
import { SettingsModal } from './SettingsModal';

export function SettingsModalOpener() {
  const [open, setOpen] = useState(false);

  const listenSettingsMenuEvent = useCallback(
    (isMounted: () => boolean) =>
      listenEvent(RefStudioEvents.menu.settings, () => {
        if (isMounted()) {
          setOpen((curr) => !curr);
        }
      }),
    [],
  );

  useAsyncEffect(listenSettingsMenuEvent, (unregister) => unregister?.());

  if (!open) {
    return null;
  }

  return <SettingsModal open={open} onCloseClick={() => setOpen(false)} />;
}
