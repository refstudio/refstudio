// import { invoke } from '@tauri-apps/api';
import { useSetAtom } from 'jotai';
import { useState } from 'react';

import { App } from './application/App';
import { openProjectAtom } from './atoms/projectState';
import { useAsyncEffect } from './hooks/useAsyncEffect';
import { noop } from './lib/noop';
import { notifyErr, notifyInfo } from './notifications/notifications';
import { interceptConsoleMessages } from './notifications/notifications.console';
import { getCachedSetting, initSettings } from './settings/settingsManager';
import { invoke } from './wrappers/tauri-wrapper';

// Note: Intercepting INFO, WARN and ERROR console.* in DEV mode
if (import.meta.env.DEV) {
  interceptConsoleMessages(true, true, true);
}

export function AppStartup() {
  const [initialized, setInitialized] = useState(false);
  const openProject = useSetAtom(openProjectAtom);

  useAsyncEffect(
    async (isMounted) => {
      try {
        if (initialized) {
          return;
        }

        notifyInfo('Application Startup');
        await initSettings();
        await invoke('close_splashscreen');

        if (isMounted()) {
          setInitialized(true);
          const projectDir = getCachedSetting('project.currentDir');
          if (projectDir) {
            await openProject(projectDir);
          }
          notifyInfo('Application Initialized');
        }
      } catch (err) {
        notifyErr(err);
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
