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
import { notifyInfo, notifyWarning } from '../../notifications/notifications';
import { saveCachedSettings, setCachedSetting } from '../../settings/settingsManager';
import { createRemoteProject, ProjectInfo, readAllProjects, readProjectById } from '../../web';

export function useFileProjectNewListener() {
  const newProject = useSetAtom(newProjectAtom);
  const createFile = useSetAtom(createFileAtom);

  return async () => {
    let projectInfo: ProjectInfo;
    if (import.meta.env.VITE_IS_WEB) {
      const projectName = 'Project Web'; // TODO: Open a custom dialog to ask the project name
      projectInfo = await createRemoteProject(projectName);
    } else {
      const newProjectPath = await save({ defaultPath: await getNewProjectsBaseDir() });
      if (typeof newProjectPath !== 'string') {
        notifyInfo('User canceled operation to create new project');
        return;
      }
      const projectName = newProjectPath.split('/').pop() ?? 'Project';
      projectInfo = await createRemoteProject(projectName, newProjectPath);
    }

    await newProject(projectInfo.id, projectInfo.path, projectInfo.name);
    createFile();
    notifyInfo('New project created with success');
    persistProjectIdInSettings(projectInfo.id);
  };
}

export function useFileProjectNewSampleListener() {
  const sampleProject = useSetAtom(newSampleProjectAtom);
  return async () => {
    const newProjectPath = `${await getNewProjectsBaseDir()}RefStudio Sample`;
    await sampleProject(newProjectPath);
    persistProjectIdInSettings(newProjectPath);
    notifyInfo('New project created at ' + newProjectPath);
  };
}

export function useFileProjectOpenListener() {
  const openProject = useSetAtom(openProjectAtom);

  return async () => {
    let projectId: string;
    if (import.meta.env.VITE_IS_WEB) {
      // TODO: Open a custom dialog with all projects to select one
      // For now, opens the first project found
      const projects = await readAllProjects();
      projectId = projects[0].id;
    } else {
      const selectedPath = await open({
        directory: true,
        multiple: false,
        defaultPath: await getNewProjectsBaseDir(),
        title: 'Open RefStudio project',
      });

      if (typeof selectedPath === 'string') {
        const projects = await readAllProjects();
        const projectWithSamePath = projects.find((project) => project.path === selectedPath);
        if (!projectWithSamePath) {
          notifyWarning('You need to open a project that was previously created with RefStudio.');
          return;
        }
        projectId = projectWithSamePath.id;
      } else {
        notifyInfo('User canceled operation to open new project');
        return;
      }
    }

    const projectToOpen = await readProjectById(projectId);
    await openProject(projectId, projectToOpen.path, projectToOpen.name);
    persistProjectIdInSettings(projectId);
    notifyInfo('New project open.');
  };
}

export function useFileProjectCloseListener() {
  const isOpen = useAtomValue(isProjectOpenAtom);
  const closeProject = useSetAtom(closeProjectAtom);

  return () => {
    if (isOpen) {
      void closeProject();
      persistProjectIdInSettings('');
      notifyInfo('Project closed');
    }
  };
}

// TODO: This method needs to be refactored to have use a project id instead of a path
function persistProjectIdInSettings(path: string) {
  setCachedSetting('project.current_directory', path);
  void saveCachedSettings();
}
