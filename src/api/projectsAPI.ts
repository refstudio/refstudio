/** Utility for calling the backend python backend webserver, for the WEB flow. */

interface ProjectIdResponse {
  project_id: string;
  project_path: string;
  filepaths: string[];
}

export async function getRemoteProject(projectId: string) {
  const res = await fetch(`/api/projects/${projectId}`);
  const data: ProjectIdResponse = res.json() as unknown as ProjectIdResponse;
  return data;
}

export async function postRemoteProject(projectName: string) {
  const response = await fetch(`/api/projects/?project_name=${projectName}`, {
    method: 'POST',
    // We need to update the API definition in order to use BODY
    // https://stackoverflow.com/questions/59929028/python-fastapi-error-422-with-post-request-when-sending-json-data
    // body: JSON.stringify({ project_name: projectName }),
    headers: {
      Accept: 'application/json',
    },
  });
  const payload = (await response.json()) as Record<string, { project_name: string; project_path: string }>;
  const projectId = Object.keys(payload)[0];
  const { project_path, project_name } = payload[projectId];
  return {
    projectId,
    projectPath: project_path,
    projectName: project_name,
  };
}
