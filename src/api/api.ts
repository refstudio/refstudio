import { Body, fetch as tauriFetch } from '@tauri-apps/api/http';

import { REFSTUDIO_HOST } from './server';

/** Issue a GET request using either web fetch or Tauri fetch */
export async function universalGet<ResponsePayload = unknown>(path: string): Promise<ResponsePayload> {
  return universalRequest<ResponsePayload>('GET', path);
  // if (import.meta.env.VITE_IS_WEB) {
  //   const response = await fetch(path);
  //   if (!response.ok) {
  //     throw new Error(`Failed to get ${path}: ${response.statusText}`);
  //   }
  //   return response.json() as ResponsePayload;
  // } else {
  //   const response = await tauriFetch(REFSTUDIO_HOST + path);
  //   if (!response.ok) {
  //     throw new Error(`Failed to get ${path}: ${response.status}`);
  //   }
  //   return response.data as ResponsePayload;
  // }
}

/** Issue a POST request with a JSON payload using either web fetch or Tauri fetch */
export async function universalPost<ResponsePayload = unknown, RequestPayload = unknown>(
  path: string,
  payload?: RequestPayload,
): Promise<ResponsePayload> {
  return universalRequest('POST', path, payload);
}

/** Issue a PUT request with a JSON payload using either web fetch or Tauri fetch */
export async function universalPut<ResponsePayload = unknown, RequestPayload = unknown>(
  path: string,
  payload: RequestPayload,
): Promise<ResponsePayload> {
  return universalRequest('PUT', path, payload);
}

/** Issue a DELETE request with a JSON payload using either web fetch or Tauri fetch */
export async function universalDelete<ResponsePayload = unknown, RequestPayload = unknown>(
  path: string,
  payload: RequestPayload,
): Promise<ResponsePayload> {
  return universalRequest('DELETE', path, payload);
}

/** Issue a PATH request with a JSON payload using either web fetch or Tauri fetch */
export async function universalPatch<ResponsePayload = unknown, RequestPayload = unknown>(
  path: string,
  payload: RequestPayload,
): Promise<ResponsePayload> {
  return universalRequest('PATCH', path, payload);
}

/** Issue a request with a JSON payload using either web fetch or Tauri fetch */
async function universalRequest<ResponsePayload = unknown, RequestPayload = unknown>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  path: string,
  payload?: RequestPayload,
): Promise<ResponsePayload> {
  try {
    if (import.meta.env.VITE_IS_WEB) {
      console.log(`WEB FETCH REQUEST: ${method} ${path}`);
      const response = await fetch(path, {
        method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: payload ? JSON.stringify(payload) : undefined,
      });
      console.log('WEB FETCH RESPONSE STATUS:', response.status);
      if (!response.ok) {
        throw new Error(`Failed to post ${path}: ${response.statusText}`);
      }
      const data = (await response.json()) as ResponsePayload;
      console.log('TAURI FETCH RESPONSE DATA:', data);
      return data;
    } else {
      console.log(`TAURI FETCH REQUEST: ${method} ${path}`);
      const response = await tauriFetch(REFSTUDIO_HOST + path, {
        method,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        body: payload ? Body.json(payload as any) : undefined,
      });
      console.log('TAURI FETCH RESPONSE STATUS', response.status);
      if (!response.ok) {
        throw new Error(`Failed to get ${path}: ${response.status}`);
      }
      console.log('TAURI FETCH RESPONSE DATA', response.data);
      return response.data as ResponsePayload;
    }
  } catch (e) {
    console.error(`Failed to fetch ${method} ${path}: ${e}`);
    throw e;
  }
}
