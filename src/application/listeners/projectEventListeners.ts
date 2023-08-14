import { open } from '@tauri-apps/api/dialog';
import { useSetAtom } from 'jotai';

import { closeProjectAtom, openProjectAtom } from '../../atoms/projectState';
import { getNewProjectsBaseDir } from '../../io/filesystem';
import { notifyInfo } from '../../notifications/notifications';
import { saveCachedSettings, setCachedSetting } from '../../settings/settingsManager';

export function useFileProjectNewListener() {
  const closeProject = useSetAtom(closeProjectAtom);

  return () => void closeProject();
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
  const closeProject = useSetAtom(closeProjectAtom);

  return () => {
    void closeProject();
    setCachedSetting('general.projectDir', '');
    void saveCachedSettings();
  };
}
