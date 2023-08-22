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

export async function postRemoteProject() {
  const response = await fetch(`/api/projects/`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
  });
  const payload = (await response.json()) as Record<string, string>;
  const projectId = Object.keys(payload)[0];
  const projectPath = payload[projectId];
  return {
    projectId,
    projectPath,
  };
}
