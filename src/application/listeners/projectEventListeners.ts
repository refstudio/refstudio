import { ask, open, save } from '@tauri-apps/api/dialog';
import { useAtomValue, useSetAtom } from 'jotai';

import { refreshFileTreeAtom } from '../../atoms/fileExplorerActions';
import { closeProjectAtom, isProjectOpenAtom, openProjectAtom, projectNameAtom } from '../../atoms/projectState';
import { getNewProjectsBaseDir } from '../../io/filesystem';
import { notifyInfo } from '../../notifications/notifications';
import { saveCachedSettings, setCachedSetting } from '../../settings/settingsManager';

export function useFileProjectNewListener() {
  const closeProject = useSetAtom(closeProjectAtom);
  const openProject = useSetAtom(openProjectAtom);
  const refreshFileTree = useSetAtom(refreshFileTreeAtom);

  return () => {
    const run = async () => {
      const newProjectPath = await save({
        defaultPath: await getNewProjectsBaseDir(),
      });

      if (typeof newProjectPath === 'string') {
        console.log('close');
        await closeProject();
        setCachedSetting('general.projectDir', newProjectPath);
        console.log('save settings');
        await saveCachedSettings();
        console.log('open project at ', newProjectPath);
        await openProject(newProjectPath);
        notifyInfo('New project created at ' + newProjectPath);
      }
    };

    console.log('START');
    run()
      .then(() => {
        console.log('Done');
        void refreshFileTree();
      })
      .catch((err) => console.error(err));
  };
}

export function useFileProjectOpenListener() {
  const closeProject = useSetAtom(closeProjectAtom);
  const openProject = useSetAtom(openProjectAtom);

  return () => {
    const run = async () => {
      const selectedPath = await open({
        directory: true,
        multiple: false,
        defaultPath: await getNewProjectsBaseDir(),
        title: 'Open RefStudio project',
      });

      if (typeof selectedPath === 'string') {
        notifyInfo('Selected folder', selectedPath);

        await closeProject();
        setCachedSetting('general.projectDir', selectedPath);
        await saveCachedSettings();
        await openProject(selectedPath);
      }
    };
    // execute
    void run();
  };
}

export function useFileProjectCloseListener() {
  const isOpen = useAtomValue(isProjectOpenAtom);
  const projectName = useAtomValue(projectNameAtom);
  const closeProject = useSetAtom(closeProjectAtom);

  return () => {
    const run = async () => {
      if (isOpen) {
        const ok = await ask('Sure you want to close the project?', { title: projectName });
        if (ok) {
          void closeProject();
          setCachedSetting('general.projectDir', '');
          void saveCachedSettings();
        }
      }
    };

    void run();
  };
}
