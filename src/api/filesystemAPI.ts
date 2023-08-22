/** Utility for calling the backend python backend webserver, for the WEB flow. */

export async function getRemoteFile(projectId: string, filePath: string): Promise<string | ArrayBuffer> {
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

export async function writeRemoteTextFile(projectId: string, filePath: string, content: string) {
  const data = new FormData();
  const fileName = filePath;
  const file = new File([content], fileName, { type: 'text/plain' });
  data.append('file', file);

  await fetch(`/api/fs/${projectId}/${filePath}`, {
    method: 'PUT',
    body: data,
  });
}

export async function writeRemotePdfFile(projectId: string, filePath: string, content: ArrayBuffer) {
  const data = new FormData();
  const fileName = filePath;
  const file = new File([content], fileName, { type: 'application/pdf' });
  data.append('file', file);

  await fetch(`/api/fs/${projectId}/${filePath}`, {
    method: 'PUT',
    body: data,
  });
}

export async function deleteRemoteFile(projectId: string, filePath: string) {
  await fetch(`/api/fs/${projectId}/${filePath}`, {
    method: 'DELETE',
  });
}
