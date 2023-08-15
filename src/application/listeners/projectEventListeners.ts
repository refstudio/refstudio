import { open, save } from '@tauri-apps/api/dialog';
import { useAtomValue, useSetAtom } from 'jotai';

import { closeProjectAtom, isProjectOpenAtom, newSampleProjectAtom, openProjectAtom } from '../../atoms/projectState';
import { getNewProjectsBaseDir } from '../../io/filesystem';
import { notifyInfo } from '../../notifications/notifications';
import { saveCachedSettings, setCachedSetting } from '../../settings/settingsManager';

export function useFileProjectNewListener() {
  const openProject = useSetAtom(openProjectAtom);

  return () => {
    const run = async () => {
      const newProjectPath = await save({
        defaultPath: await getNewProjectsBaseDir(),
      });

      if (typeof newProjectPath === 'string') {
        await openProject(newProjectPath);
        setCachedSetting('general.projectDir', newProjectPath);
        await saveCachedSettings();
        notifyInfo('New project created at ' + newProjectPath);
      }
    };

    void run();
  };
}

export function useFileProjectNewSampleListener() {
  const sampleProject = useSetAtom(newSampleProjectAtom);

  return () => {
    const run = async () => {
      const newProjectPath = `${await getNewProjectsBaseDir()}RefStudio Sample`;
      await sampleProject(newProjectPath);
      setCachedSetting('general.projectDir', newProjectPath);
      await saveCachedSettings();
      notifyInfo('New project created at ' + newProjectPath);
    };

    void run();
  };
}

export function useFileProjectOpenListener() {
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
        await openProject(selectedPath);
        setCachedSetting('general.projectDir', selectedPath);
        await saveCachedSettings();
        notifyInfo('New project open at ' + selectedPath);
      }
    };
    // execute
    void run();
  };
}

export function useFileProjectCloseListener() {
  const isOpen = useAtomValue(isProjectOpenAtom);
  const closeProject = useSetAtom(closeProjectAtom);

  return () => {
    if (isOpen) {
      void closeProject();
      setCachedSetting('general.projectDir', '');
      void saveCachedSettings();
      notifyInfo('Project closed');
    }
  };
}
