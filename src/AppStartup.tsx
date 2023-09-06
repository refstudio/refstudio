import { useSetAtom } from 'jotai';
import { useState } from 'react';

import { readAllProjects, readProjectById } from './api/projectsAPI';
import { useRefStudioServerOnDesktop } from './api/server';
import { App } from './application/App';
import { allProjectsAtom, openProjectAtom } from './atoms/projectState';
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
  const setAllProjects = useSetAtom(allProjectsAtom);

  const isServerRunning = useRefStudioServerOnDesktop();
  console.log('isServerRunning=', isServerRunning);

  useAsyncEffect(
    async (isMounted) => {
      if (!isServerRunning) {
        console.log('waiting for server startup');
        return; // wait for the server to start
      }
      try {
        if (initialized) {
          return;
        }

        notifyInfo('Application Startup');
        await initSettings();
        const projects = await readAllProjects();

        await invoke('close_splashscreen');

        if (isMounted()) {
          setInitialized(true);
          setAllProjects(projects);
          const projectId = getCachedSetting('active_project_id');
          if (projectId) {
            const projectInfo = await readProjectById(projectId);
            await openProject(projectId, projectInfo.path, projectInfo.name);
          }
          notifyInfo('Application Initialized');
        }
      } catch (err) {
        notifyErr(err);
      }
    },
    noop,
    [initialized, isServerRunning],
  );

  if (!initialized) {
    return null;
  }

  return <App />;
}
