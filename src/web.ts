import { universalGet, universalPost } from './api/api';

export interface ProjectInfo {
  id: string;
  path: string;
  name: string;
}

interface ProjectGetResponse {
  project_id: string;
  project_path: string;
  project_name: string;
  filepaths: string[];
}

type ProjectsResponse = Record<string, { project_name: string; project_path: string }>;
type ProjectPostResponse = ProjectsResponse;

// ########################################################################################
// PROJECT
// ########################################################################################
export async function readAllProjects() {
  const projects = await universalGet<ProjectsResponse>(`/api/projects/`);
  return Object.keys(projects).map(
    (id) => ({ id, path: projects[id].project_path, name: projects[id].project_name } as ProjectInfo),
  );
}
export async function readProjectById(projectId: string) {
  const projectInfo = await universalGet<ProjectGetResponse>(`/api/projects/${projectId}`);
  return {
    id: projectInfo.project_id,
    path: projectInfo.project_path,
    name: projectInfo.project_name,
  } as ProjectInfo;
}

/** NOTE: This is a simplified version of the function */
export async function readProjectFilesFromWeb(projectId: string) {
  const projectInfo = await universalGet<ProjectGetResponse>(`/api/projects/${projectId}`);
  const relativePaths = projectInfo.filepaths
    .map((path) => path.replace(projectInfo.project_path + '/', '')) // Remove project path from API output
    .map((path) => path.replace(/^\//, '')); // Remove the leading / (we don't want them in the output)

  const rootFiles = relativePaths
    .filter((path) => !path.startsWith('uploads'))
    .map((path) => ({
      path,
      name: path.replace('/', ''),
      children: undefined,
    }));

  const uploadsFiles = relativePaths
    .filter((path) => path.startsWith('uploads/'))
    .map((path) => ({
      path,
      name: path.replace('uploads/', ''),
      children: undefined,
    }));

  return [
    ...rootFiles,
    {
      path: 'uploads',
      name: 'uploads',
      children: uploadsFiles,
    },
  ];
}

export async function createRemoteProject(projectName: string, projectPath?: string) {
  const payload = await universalPost<ProjectPostResponse>(
    `/api/projects/?project_name=${projectName}&project_path=${encodeURIComponent(projectPath ?? '')}`,
    {},
  );
  const projectId = Object.keys(payload)[0];
  const { project_path, project_name } = payload[projectId];

  return {
    id: projectId,
    path: project_path,
    name: project_name,
  } as ProjectInfo;
}

// ########################################################################################
// FILESYSTEM
// ########################################################################################
export const writeTextFileFromWeb = async (projectId: string, filePath: string, contents: string) => {
  await writeRemoteTextFile(projectId, filePath, contents);
};

export const writeBinaryFileFromWeb = async (projectId: string, filePath: string, contents: ArrayBuffer) => {
  await writeRemotePdfFile(projectId, filePath, contents);
};

export const readTextFileFromWeb = async (projectId: string, filePath: string) => {
  const content = await getRemoteFile(projectId, filePath);
  if (typeof content === 'string') {
    return content;
  }
  throw new Error('Invalid file format.');
};

export const readBinaryFileFromWeb = async (projectId: string, filePath: string) => {
  const content = await getRemoteFile(projectId, filePath);
  if (content !== null && typeof content !== 'string') {
    return new Uint8Array(content);
  }
  throw new Error('Invalid file format.');
};

export const deleteFileFromWeb = async (projectId: string, filePath: string) => {
  await deleteRemoteFile(projectId, filePath);
};

export const renameFileFromWeb = async (projectId: string, filePath: string, newFilePath: string) => {
  const data = await getRemoteFile(projectId, filePath);
  if (!data) {
    throw new Error('Cannot get file to rename');
  }
  await deleteRemoteFile(projectId, filePath);
  if (data instanceof ArrayBuffer) {
    await writeRemotePdfFile(projectId, newFilePath, data);
  } else {
    await writeRemoteTextFile(projectId, newFilePath, data);
  }
};

/** NOTE: We should improve this with a HEAD /{projectid}/{path} endpoint in the fs API */
export const existsFileFromWeb = async (projectId: string, filePath: string) => {
  const data = await getRemoteFile(projectId, filePath);
  return data !== null;
};

// ########################################################################################
// (private) API WRAPPERS
//
//  - Utility for calling the backend python backend webserver, for the WEB flow.
// ########################################################################################
async function getRemoteFile(projectId: string, filePath: string): Promise<string | ArrayBuffer | null> {
  const response = await fetch(`/api/fs/${projectId}/${filePath}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });
  if (response.headers.get('content-type') === 'application/pdf') {
    return response.arrayBuffer();
  }
  return response.text();
}

async function writeRemoteTextFile(projectId: string, filePath: string, content: string) {
  const data = new FormData();
  const fileName = filePath;
  const file = new File([content], fileName, { type: 'text/plain' });
  data.append('file', file);

  await fetch(`/api/fs/${projectId}/${filePath}`, {
    method: 'PUT',
    body: data,
  });
}

async function writeRemotePdfFile(projectId: string, filePath: string, content: ArrayBuffer) {
  const data = new FormData();
  const fileName = filePath;
  const file = new File([content], fileName, { type: 'application/pdf' });
  data.append('file', file);

  await fetch(`/api/fs/${projectId}/${filePath}`, {
    method: 'PUT',
    body: data,
  });
}

async function deleteRemoteFile(projectId: string, filePath: string) {
  await fetch(`/api/fs/${projectId}/${filePath}`, {
    method: 'DELETE',
  });
}
