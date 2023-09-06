import { save } from '@tauri-apps/api/dialog';
import { useAtomValue, useSetAtom } from 'jotai';

import { createRemoteProject, ProjectInfo, readAllProjects, readProjectById } from '../../api/projectsAPI';
import { CreateModalResult } from '../../atoms/core/createModalAtoms';
import { createFileAtom } from '../../atoms/fileEntryActions';
import {
  closeProjectAtom,
  createProjectModalAtoms,
  isProjectOpenAtom,
  newProjectAtom,
  newSampleProjectAtom,
  openProjectAtom,
  selectProjectModalAtoms,
} from '../../atoms/projectState';
import { emitEvent } from '../../events';
import { getNewProjectsBaseDir } from '../../io/filesystem';
import { notifyInfo } from '../../notifications/notifications';
import { saveCachedSettings, setCachedSetting } from '../../settings/settingsManager';

export const SAMPLE_PROJECT_NAME = 'RefStudio Sample';

export function useFileProjectNewListener() {
  const newProject = useSetAtom(newProjectAtom);
  const createFile = useSetAtom(createFileAtom);
  const openCreateProjectModal = useSetAtom(createProjectModalAtoms.openAtom);

  return async () => {
    const projectInfo = import.meta.env.VITE_IS_WEB
      ? await makeNewProjectforWeb(() => openCreateProjectModal())
      : await makeNewProjectForDesktop();

    if (!projectInfo) {
      notifyInfo('User canceled operation to create new project');
      return;
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
  const openSelectProjectModal = useSetAtom(selectProjectModalAtoms.openAtom);
  return async () => {
    const modalResult = await openSelectProjectModal();
    if (modalResult.status === 'dismissed') {
      notifyInfo('User canceled operation to open new project');
      return;
    }
    const projectId = modalResult.value;
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

/**
 * ######################################################
 *
 * UTILITY FUNCTIONS to create/open new projects
 *
 * ######################################################
 */
async function makeNewProjectforWeb(
  modalCreator: () => Promise<CreateModalResult<string>>,
): Promise<ProjectInfo | undefined> {
  const modalResult = await modalCreator();
  if (modalResult.status === 'dismissed') {
    return;
  } else {
    return createRemoteProject(modalResult.value);
  }
}

async function makeNewProjectForDesktop(): Promise<ProjectInfo | undefined> {
  const newProjectPath = await save({ defaultPath: await getNewProjectsBaseDir() });
  if (typeof newProjectPath !== 'string') {
    return;
  }
  const projectName = newProjectPath.split('/').pop() ?? 'Project';
  return createRemoteProject(projectName, newProjectPath);
}
