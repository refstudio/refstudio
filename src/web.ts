import { getRemoteProject } from './api/projectsAPI';

// ########################################################################################
// HOSTING ENVIRONMENT CHECK
// ########################################################################################

/**
 * Check if the app is running outside of Tauri, in a web context.
 *
 * @returns true if the app is running in a web context, outside of Tauri
 */
export function isRunningOnWeb() {
  return !!import.meta.env.VITE_IS_WEB;
}

// ########################################################################################
// PROJECT
// ########################################################################################
export async function readProjectInfoFromWeb(projectId: string) {
  const projectInfo = await getRemoteProject(projectId);
  return {
    id: projectId,
    path: projectInfo.project_path,
    name: projectInfo.project_path.split('/').pop(),
  };
}

/** NOTE: This is a simplified version of the function */
export async function readProjectFilesFromWeb(projectId: string) {
  const projectInfo = await getRemoteProject(projectId);
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
