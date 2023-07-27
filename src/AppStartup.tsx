import { invoke } from '@tauri-apps/api';
import { useState } from 'react';

import { App } from './application/App';
import { useAsyncEffect } from './hooks/useAsyncEffect';
import { openProject } from './io/filesystem';
import { noop } from './lib/noop';
import { notifyInfo } from './notifications/notifications';
import { interceptConsoleMessages } from './notifications/notifications.console';
import { getCachedSetting, initSettings } from './settings/settingsManager';

// Note: Intercepting INFO, WARN and ERROR console.*
interceptConsoleMessages(true, true, true);

export function AppStartup() {
  const [initialized, setInitialized] = useState(false);

  useAsyncEffect(
    async (isMounted) => {
      if (initialized) {
        return;
      }

      notifyInfo('Application Startup');
      await initSettings();
      await openProject(getCachedSetting('general.appDataDir'));
      await invoke('close_splashscreen');

      notifyInfo('Application Initialized');

      if (isMounted()) {
        setInitialized(true);
      }
    },
    noop,
    [initialized],
  );

  if (!initialized) {
    return null;
  }

  return <App />;
}
