import './index.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { Provider } from 'jotai';
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

import App from './application/App';
import { useAsyncEffect } from './hooks/useAsyncEffect';
import { ensureProjectFileStructure } from './io/filesystem';
import { noop } from './lib/noop';
import { notifyInfo } from './notifications/notifications';
import { interceptConsoleMessages } from './notifications/notifications.console';
import { initSettings } from './settings/settingsManager';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider>
      <QueryClientProvider client={queryClient}>
        <AppStartup />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
);

function AppStartup() {
  const [initialized, setInitialized] = useState(false);

  useAsyncEffect(
    async () => {
      // Note: Intercepting INFO, WARN and ERROR console.*
      interceptConsoleMessages(true, true, true);

      notifyInfo('Application Startup');
      await initSettings();
      await ensureProjectFileStructure();
      await invoke('close_splashscreen');
      notifyInfo('Application Initialized');

      setInitialized(true);
    },
    noop,
    [setInitialized],
  );

  if (!initialized) {
    return null;
  }

  return <App />;
}
