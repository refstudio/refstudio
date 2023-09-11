import { useState } from 'react';

import { useRefStudioServerOnDesktop } from './api/server';
import { AppSimple } from './application/App';
import { useAsyncEffect } from './hooks/useAsyncEffect';
import { noop } from './lib/noop';
import { notifyErr, notifyInfo } from './notifications/notifications';
import { interceptConsoleMessages } from './notifications/notifications.console';
import { invoke } from './wrappers/tauri-wrapper';

// Note: Intercepting INFO, WARN and ERROR console.* in DEV mode
if (import.meta.env.DEV) {
  interceptConsoleMessages(true, true, true);
}

export function AppStartup() {
  const [initialized, setInitialized] = useState(false);
  // const openProject = useSetAtom(openProjectAtom);
  // const setAllProjects = useSetAtom(allProjectsAtom);

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
        // await initSettings();

        // const projectId = getCachedSetting('active_project_id');
        // const [projectInfo, projects] = await Promise.all([
        //   projectId ? await readProjectById(projectId) : null,
        //   readAllProjects(),
        // ]);

        await invoke('close_splashscreen');

        if (isMounted()) {
          setInitialized(true);
          // setAllProjects(projects);
          // if (projectInfo) {
          //   await openProject(projectId, projectInfo.name);
          // }
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

  return <AppSimple />;
}
