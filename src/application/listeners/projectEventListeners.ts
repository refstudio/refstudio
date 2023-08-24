import { open, save } from '@tauri-apps/api/dialog';
import { useAtomValue, useSetAtom } from 'jotai';

import { createFileAtom } from '../../atoms/fileEntryActions';
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
  const createFile = useSetAtom(createFileAtom);

  return async () => {
    const newProjectPath = import.meta.env.VITE_IS_WEB
      ? `${await getNewProjectsBaseDir()}New Project`
      : await save({ defaultPath: await getNewProjectsBaseDir() });
    if (typeof newProjectPath === 'string') {
      await newProject(newProjectPath);
      createFile();
      persistProjectDirInSettings(newProjectPath);
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
  setCachedSetting('project.current_directory', path);
  void saveCachedSettings();
}
