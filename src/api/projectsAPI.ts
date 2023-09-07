import { universalGet, universalHead, universalPutFile } from './api';
import { apiDelete, apiGetJson, apiPost } from './typed-api';

export interface ProjectInfo {
  id: string;
  path: string;
  name: string;
}

type ProjectsResponse = Record<string, { project_name: string; project_path: string }>;
type ProjectPostResponse = ProjectsResponse;

// ########################################################################################
// PROJECT LIFE CYCLE
// ########################################################################################
export async function readAllProjects(): Promise<ProjectInfo[]> {
  const projects = (await apiGetJson('/api/projects/')) as ProjectsResponse;
  return Object.keys(projects).map((id) => ({ id, path: projects[id].project_path, name: projects[id].project_name }));
}

export async function readProjectById(projectId: string): Promise<ProjectInfo> {
  const projectInfo = await apiGetJson('/api/projects/{project_id}', {
    path: { project_id: projectId },
  });
  return {
    id: projectInfo.id,
    path: projectInfo.path,
    name: projectInfo.name,
  };
}

export async function createRemoteProject(projectName: string, projectPath?: string): Promise<ProjectInfo> {
  const payload = (await apiPost('/api/projects/', {
    project_name: projectName,
    project_path: projectPath,
  })) as ProjectPostResponse;

  const projectId = Object.keys(payload)[0];
  const { project_path, project_name } = payload[projectId];

  return {
    id: projectId,
    path: project_path,
    name: project_name,
  };
}

// ########################################################################################
// PROJECT FILE STRUCTURE
// ########################################################################################
export async function readProjectFiles(projectId: string) {
  return apiGetJson('/api/projects/{project_id}/files', { path: { project_id: projectId } });
}

// ########################################################################################
// PROJECT FILE SYSTEM
// ########################################################################################
export const writeProjectTextFile = async (projectId: string, relativeFilePath: string, contents: string) =>
  universalPutFile(`/api/fs/${projectId}/${relativeFilePath}`, relativeFilePath, contents);

export const writeProjectBinaryFile = async (projectId: string, relativeFilePath: string, contents: ArrayBuffer) =>
  universalPutFile(`/api/fs/${projectId}/${relativeFilePath}`, relativeFilePath, contents);

export const readProjectTextFile = async (projectId: string, filePath: string) => {
  try {
    const responseBuffer = await universalGet<ArrayBuffer>(`/api/fs/${projectId}/${filePath}`, 'ArrayBuffer');
    const textContent = new TextDecoder().decode(new Uint8Array(responseBuffer));
    return textContent;
  } catch (err) {
    console.error('Error reading text file', err);
    throw new Error('Invalid file format.');
  }
};

export const readProjectBinaryFile = async (projectId: string, filePath: string) => {
  try {
    const responseBuffer = await universalGet<ArrayBuffer>(`/api/fs/${projectId}/${filePath}`, 'ArrayBuffer');
    return new Uint8Array(responseBuffer);
  } catch (err) {
    console.error('Error reading binary file', err);
    throw new Error('Invalid file format.');
  }
};

export const existsProjectFile = async (projectId: string, filePath: string) => {
  const status = await universalHead(`/api/fs/${projectId}/${filePath}`);
  return status === 200;
};

export const deleteProjectFile = async (projectId: string, relativeFilePath: string) => {
  await apiDelete('/api/fs/{project_id}/{filepath}', { path: { project_id: projectId, filepath: relativeFilePath } });
};

export const renameProjectFile = async (projectId: string, relativeFilePath: string, newFilePath: string) => {
  const fileExists = await existsProjectFile(projectId, relativeFilePath);
  if (!fileExists) {
    throw new Error("File to rename don't exists in the project.");
  }
  const targetFileExists = await existsProjectFile(projectId, newFilePath);
  if (targetFileExists) {
    throw new Error('Target file name already exists in the project.');
  }

  const fileContent = await readProjectBinaryFile(projectId, relativeFilePath);

  await deleteProjectFile(projectId, relativeFilePath);
  await universalPutFile(`/api/fs/${projectId}/${newFilePath}`, newFilePath, fileContent);
};
