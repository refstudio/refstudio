import { open, save } from '@tauri-apps/api/dialog';
import { useAtomValue, useSetAtom } from 'jotai';

import {
  closeProjectAtom,
  isProjectOpenAtom,
  newProjectAtom,
  newSampleProjectAtom,
  openProjectAtom,
} from '../../atoms/projectState';
import { getNewProjectsBaseDir } from '../../io/filesystem';
import { notifyInfo } from '../../notifications/notifications';
import { saveCachedSettings, setCachedSetting } from '../../settings/settingsManager';

export function useFileProjectNewListener() {
  const newProject = useSetAtom(newProjectAtom);

  return async () => {
    const newProjectPath = await save({ defaultPath: await getNewProjectsBaseDir() });
    if (typeof newProjectPath === 'string') {
      await newProject(newProjectPath);
      setCachedSetting('general.projectDir', newProjectPath);
      await saveCachedSettings();
      notifyInfo('New project created at ' + newProjectPath);
    }
  };
}

export function useFileProjectNewSampleListener() {
  const sampleProject = useSetAtom(newSampleProjectAtom);
  return async () => {
    const newProjectPath = `${await getNewProjectsBaseDir()}RefStudio Sample`;
    await sampleProject(newProjectPath);
    persistProjectDirInSettings(newProjectPath);
    notifyInfo('New project created at ' + newProjectPath);
  };
}

export function useFileProjectOpenListener() {
  const openProject = useSetAtom(openProjectAtom);

  return async () => {
    const selectedPath = await open({
      directory: true,
      multiple: false,
      defaultPath: await getNewProjectsBaseDir(),
      title: 'Open RefStudio project',
    });

    if (typeof selectedPath === 'string') {
      await openProject(selectedPath);
      persistProjectDirInSettings(selectedPath);
      notifyInfo('New project open at ' + selectedPath);
    }
  };
}

export function useFileProjectCloseListener() {
  const isOpen = useAtomValue(isProjectOpenAtom);
  const closeProject = useSetAtom(closeProjectAtom);

  return () => {
    if (isOpen) {
      void closeProject();
      persistProjectDirInSettings('');
      notifyInfo('Project closed');
    }
  };
}

function persistProjectDirInSettings(path: string) {
  setCachedSetting('general.projectDir', path);
  void saveCachedSettings();
}
