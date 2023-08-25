import { Body, fetch as tauriFetch } from '@tauri-apps/api/http';

import { REFSTUDIO_HOST } from './server';

/** Issue a GET request using either web fetch or Tauri fetch */
export async function universalGet<ResponsePayload = unknown>(path: string): Promise<ResponsePayload> {
  if (import.meta.env.VITE_IS_WEB) {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to get ${path}: ${response.statusText}`);
    }
    return response.json() as ResponsePayload;
  } else {
    const response = await tauriFetch(REFSTUDIO_HOST + path);
    if (!response.ok) {
      throw new Error(`Failed to get ${path}: ${response.status}`);
    }
    return response.data as ResponsePayload;
  }
}

/** Issue a POST request with a JSON payload using either web fetch or Tauri fetch */
// Note: Comment this out for the first need of POST. We need to comment this out because of Knip.
// export async function universalPost<ResponsePayload = unknown, RequestPayload = unknown>(
//   path: string,
//   payload: RequestPayload,
// ): Promise<ResponsePayload> {
//   return universalRequest('POST', path, payload);
// }

/** Issue a PUT request with a JSON payload using either web fetch or Tauri fetch */
export async function universalPut<ResponsePayload = unknown, RequestPayload = unknown>(
  path: string,
  payload: RequestPayload,
): Promise<ResponsePayload> {
  return universalRequest('PUT', path, payload);
}

/** Issue a request with a JSON payload using either web fetch or Tauri fetch */
async function universalRequest<ResponsePayload = unknown, RequestPayload = unknown>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  payload: RequestPayload,
): Promise<ResponsePayload> {
  if (import.meta.env.VITE_IS_WEB) {
    const response = await fetch(path, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to post ${path}: ${response.statusText}`);
    }
    return response.json() as ResponsePayload;
  } else {
    const response = await tauriFetch(REFSTUDIO_HOST + path, {
      method,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      body: Body.json(payload as any),
    });
    if (!response.ok) {
      throw new Error(`Failed to get ${path}: ${response.status}`);
    }
    return response.data as ResponsePayload;
  }
}
