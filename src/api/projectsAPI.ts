/** Utility for calling the backend python backend webserver, for the WEB flow. */

export async function postNewProject() {
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
