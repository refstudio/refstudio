import { open, save } from '@tauri-apps/api/dialog';
import { useAtomValue, useSetAtom } from 'jotai';

import { createRemoteProject, ProjectInfo, readAllProjects, readProjectById } from '../../api/projectsAPI';
import { createFileAtom } from '../../atoms/fileEntryActions';
import {
  closeProjectAtom,
  isProjectOpenAtom,
  newProjectAtom,
  newSampleProjectAtom,
  openProjectAtom,
} from '../../atoms/projectState';
import { emitEvent } from '../../events';
import { getNewProjectsBaseDir } from '../../io/filesystem';
import { notifyInfo, notifyWarning } from '../../notifications/notifications';
import { saveCachedSettings, setCachedSetting } from '../../settings/settingsManager';

export const SAMPLE_PROJECT_NAME = 'RefStudio Sample';

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
    persistActiveProjectInSettings(projectInfo.id);
  };
}

export function useFileProjectNewSampleListener() {
  const sampleProject = useSetAtom(newSampleProjectAtom);
  const createFile = useSetAtom(createFileAtom);
  return async () => {
    const projects = await readAllProjects();
    let project = projects.find((p) => p.name === SAMPLE_PROJECT_NAME);
    if (!project) {
      project = await createRemoteProject('RefStudio Sample');
    }
    await sampleProject(project.id, project.name, project.path);
    createFile();
    notifyInfo('Sample project opened with success');
    persistActiveProjectInSettings(project.id);
  };
}

export function useFileProjectOpenListener() {
  return async () => {
    let projectId: string;
    if (import.meta.env.VITE_IS_WEB) {
      // TODO: Open a custom dialog with all projects to select one
      // For now, opens the first project found
      const projects = await readAllProjects();
      if (projects.length === 0) {
        throw new Error('No projects found');
      }
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

    emitEvent('refstudio://projects/open', { projectId });
  };
}

export function useFileProjectCloseListener() {
  const isOpen = useAtomValue(isProjectOpenAtom);
  const closeProject = useSetAtom(closeProjectAtom);

  return () => {
    if (isOpen) {
      void closeProject();
      persistActiveProjectInSettings('');
      notifyInfo('Project closed');
    }
  };
}

function persistActiveProjectInSettings(id: string) {
  setCachedSetting('active_project_id', id);
  void saveCachedSettings();
}

export function useOpenProjectListener() {
  const openProject = useSetAtom(openProjectAtom);

  return async ({ projectId }: { projectId: string }) => {
    const projectToOpen = await readProjectById(projectId);
    await openProject(projectId, projectToOpen.path, projectToOpen.name);
    persistActiveProjectInSettings(projectId);
    notifyInfo('New project open.');
  };
}
