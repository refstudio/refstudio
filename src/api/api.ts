import { Body, fetch as tauriFetch, ResponseType } from '@tauri-apps/api/http';

import { REFSTUDIO_HOST } from './server';

/** Issue a GET request using either web fetch or Tauri fetch */
export async function universalGet<ResponsePayload = unknown>(
  path: string,
  responseParser: 'JSON' | 'ArrayBuffer' = 'JSON',
): Promise<ResponsePayload> {
  return universalRequest<ResponsePayload>('GET', path, undefined, responseParser);
}

/** Issue a POST request with a JSON payload using either web fetch or Tauri fetch */
export async function universalPost<ResponsePayload = unknown, RequestPayload = unknown>(
  path: string,
  payload?: RequestPayload,
  responseParser: 'JSON' | 'ArrayBuffer' = 'JSON',
): Promise<ResponsePayload> {
  return universalRequest('POST', path, payload, responseParser);
}

/** Issue a PUT request with a JSON payload using either web fetch or Tauri fetch */
export async function universalPut<ResponsePayload = unknown, RequestPayload = unknown>(
  path: string,
  payload: RequestPayload,
  responseParser: 'JSON' | 'ArrayBuffer' = 'JSON',
): Promise<ResponsePayload> {
  return universalRequest('PUT', path, payload, responseParser);
}

/** Issue a DELETE request with a JSON payload using either web fetch or Tauri fetch */
export async function universalDelete<ResponsePayload = unknown, RequestPayload = unknown>(
  path: string,
  payload?: RequestPayload,
  responseParser: 'JSON' | 'ArrayBuffer' = 'JSON',
): Promise<ResponsePayload> {
  return universalRequest('DELETE', path, payload, responseParser);
}

/** Issue a PATH request with a JSON payload using either web fetch or Tauri fetch */
export async function universalPatch<ResponsePayload = unknown, RequestPayload = unknown>(
  path: string,
  payload: RequestPayload,
  responseParser: 'JSON' | 'ArrayBuffer' = 'JSON',
): Promise<ResponsePayload> {
  return universalRequest('PATCH', path, payload, responseParser);
}

/** Issue a FILE Upload using either web fetch or Tauri fetch */
export async function universalPutFile(path: string, filePath: string, content: string | ArrayBuffer) {
  const data = new FormData();
  const file = new File([content], filePath);
  data.append('file', file);
  return universalPut(path, data);
}

/** Issue a HEAD request using either web fetch or Tauri fetch */
export async function universalHead(path: string): Promise<number> {
  if (import.meta.env.VITE_IS_WEB) {
    console.log(`WEB FETCH REQUEST: HEAD ${path}`);
    const response = await fetch(path, { method: 'HEAD' });
    console.log('WEB FETCH RESPONSE STATUS', response.status);
    return response.status;
  } else {
    console.log(`TAURI FETCH REQUEST: HEAD ${path}`);
    const response = await tauriFetch(REFSTUDIO_HOST + path, { method: 'HEAD' });
    console.log('TAURI FETCH RESPONSE STATUS', response.status);
    return response.status;
  }
}

/** Issue a request with a JSON payload using either web fetch or Tauri fetch */
async function universalRequest<ResponsePayload = unknown, RequestPayload = unknown>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  path: string,
  payload?: RequestPayload,
  responseParser: 'JSON' | 'ArrayBuffer' = 'JSON',
): Promise<ResponsePayload> {
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
      throw new Error(`Failed to ${method} ${path}: ${response.statusText}`);
    }
    switch (responseParser) {
      case 'JSON':
        return (await response.json()) as ResponsePayload;
      case 'ArrayBuffer':
        return (await response.arrayBuffer()) as ResponsePayload;
    }
  } else {
    console.log(`TAURI FETCH REQUEST: ${method} ${path}`);
    const response = await tauriFetch(REFSTUDIO_HOST + path, {
      method,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      body: payload ? Body.json(payload as any) : undefined,
      responseType: responseParser === 'JSON' ? ResponseType.JSON : ResponseType.Binary,
    });
    console.log('TAURI FETCH RESPONSE STATUS', response.status);
    if (!response.ok) {
      throw new Error(`Failed to ${method} ${path}: ${response.status}`);
    }
    switch (responseParser) {
      case 'JSON':
        console.log('TAURI FETCH RESPONSE DATA', response.data);
        return response.data as ResponsePayload;
      case 'ArrayBuffer':
        console.log('TAURI FETCH RESPONSE DATA', response.data);
        return response.data as ResponsePayload;
    }
  }
}

if (import.meta.env.DEV) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).universalRequest = universalRequest;
}
