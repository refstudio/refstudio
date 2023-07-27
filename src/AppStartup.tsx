import { invoke } from '@tauri-apps/api';
import { useSetAtom } from 'jotai';
import { useState } from 'react';

import { App } from './application/App';
import { loadReferencesAtom } from './atoms/referencesState';
import { useAsyncEffect } from './hooks/useAsyncEffect';
import { openProject } from './io/filesystem';
import { noop } from './lib/noop';
import { notifyErr, notifyInfo } from './notifications/notifications';
import { interceptConsoleMessages } from './notifications/notifications.console';
import { getCachedSetting, initSettings } from './settings/settingsManager';

// Note: Intercepting INFO, WARN and ERROR console.* in DEV mode
if (import.meta.env.DEV) {
  interceptConsoleMessages(true, true, true);
}

export function AppStartup() {
  const [initialized, setInitialized] = useState(false);
  const loadReferences = useSetAtom(loadReferencesAtom);

  useAsyncEffect(
    async (isMounted) => {
      try {
        if (initialized) {
          return;
        }

        notifyInfo('Application Startup');
        await initSettings();
        const projectDir = getCachedSetting('general.projectDir');
        await openProject(projectDir);
        await invoke('close_splashscreen');

        notifyInfo('Application Initialized');

        if (isMounted()) {
          setInitialized(true);
          await loadReferences();
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
