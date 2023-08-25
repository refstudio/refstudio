import { open, save } from '@tauri-apps/api/dialog';
import { useAtomValue, useSetAtom } from 'jotai';

import { postRemoteProject } from '../../api/projectsAPI';
import { createFileAtom } from '../../atoms/fileEntryActions';
import {
  closeProjectAtom,
  isProjectOpenAtom,
  newProjectAtom,
  newSampleProjectAtom,
  newWebProjectAtom,
  openProjectAtom,
  openWebProjectAtom,
} from '../../atoms/projectState';
import { getNewProjectsBaseDir } from '../../io/filesystem';
import { notifyInfo } from '../../notifications/notifications';
import { saveCachedSettings, setCachedSetting } from '../../settings/settingsManager';
import { readProjectInfoFromWeb } from '../../web';

export function useFileProjectNewListener() {
  const newProject = useSetAtom(newProjectAtom);
  const newWebProject = useSetAtom(newWebProjectAtom);
  const createFile = useSetAtom(createFileAtom);

  return async () => {
    if (import.meta.env.VITE_IS_WEB) {
      // Open a custom dialog to ask the project name
      const projectInfo = await postRemoteProject('Project Web');
      persistProjectDirInSettings(projectInfo.projectPath);
      await newWebProject(projectInfo.projectId, projectInfo.projectPath, projectInfo.projectName);
      createFile();
      notifyInfo('New project created at ' + projectInfo.projectPath);
    } else {
      const newProjectPath = await save({ defaultPath: await getNewProjectsBaseDir() });
      if (typeof newProjectPath === 'string') {
        await newProject(newProjectPath);
        createFile();
        persistProjectDirInSettings(newProjectPath);
        notifyInfo('New project created at ' + newProjectPath);
      }
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
  const openWebProject = useSetAtom(openWebProjectAtom);

  return async () => {
    if (import.meta.env.VITE_IS_WEB) {
      // Open a custom dialog with all projects to select one
      const projectInfo = await readProjectInfoFromWeb('00000000-cafe-babe-0000-000000000000');
      return openWebProject(projectInfo.id, projectInfo.path, 'Test Project');
    }

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
  setCachedSetting('project.currentDir', path);
  void saveCachedSettings();
}
