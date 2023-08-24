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
import { isRunningOnWeb, readProjectInfoFromWeb } from '../../web';

export function useFileProjectNewListener() {
  const newProject = useSetAtom(newProjectAtom);
  const newWebProject = useSetAtom(newWebProjectAtom);
  const createFile = useSetAtom(createFileAtom);

  return async () => {
    if (isRunningOnWeb()) {
      const projectInfo = await postRemoteProject();
      persistProjectDirInSettings(projectInfo.projectPath);
      await newWebProject(projectInfo.projectId, projectInfo.projectPath);
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
    if (isRunningOnWeb()) {
      const projectInfo = await readProjectInfoFromWeb('4648e1f2-a89b-4752-960f-2ba74a0dc38c');
      return openWebProject(projectInfo.id, projectInfo.path);
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
