import { invoke } from '@tauri-apps/api';
import { useState } from 'react';

import App from './application/App';
import { useAsyncEffect } from './hooks/useAsyncEffect';
import { ensureProjectFileStructure } from './io/filesystem';
import { noop } from './lib/noop';
import { notifyInfo } from './notifications/notifications';
import { interceptConsoleMessages } from './notifications/notifications.console';
import { initSettings } from './settings/settingsManager';

export function AppStartup() {
  const [initialized, setInitialized] = useState(false);

  useAsyncEffect(
    async (isMounted) => {
      // Note: Intercepting INFO, WARN and ERROR console.*
      interceptConsoleMessages(true, true, true);

      notifyInfo('Application Startup');
      await initSettings();
      await ensureProjectFileStructure();
      await invoke('close_splashscreen');
      notifyInfo('Application Initialized');

      if (isMounted()) {
        setInitialized(true);
      }
    },
    noop,
    [],
  );

  if (!initialized) {
    return null;
  }

  return <App />;
}
