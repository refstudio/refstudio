import { Body, fetch as tauriFetch, ResponseType } from '@tauri-apps/api/http';

import { REFSTUDIO_HOST } from './server';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type ResponseParser = 'JSON' | 'ArrayBuffer';

/** Issue a GET request using either web fetch or Tauri fetch */
export async function universalGet<ResponsePayload = unknown>(
  path: string,
  responseParser: ResponseParser = 'JSON',
): Promise<ResponsePayload> {
  return universalRequest<ResponsePayload>('GET', path, undefined, responseParser);
}

/** Issue a POST request with a JSON payload using either web fetch or Tauri fetch */
export async function universalPost<ResponsePayload = unknown, RequestPayload = unknown>(
  path: string,
  payload?: RequestPayload,
  responseParser: ResponseParser = 'JSON',
): Promise<ResponsePayload> {
  return universalRequest('POST', path, payload, responseParser);
}

/** Issue a PUT request with a JSON payload using either web fetch or Tauri fetch */
export async function universalPut<ResponsePayload = unknown, RequestPayload = unknown>(
  path: string,
  payload: RequestPayload,
  responseParser: ResponseParser = 'JSON',
): Promise<ResponsePayload> {
  return universalRequest('PUT', path, payload, responseParser);
}

/** Issue a DELETE request with a JSON payload using either web fetch or Tauri fetch */
export async function universalDelete<ResponsePayload = unknown, RequestPayload = unknown>(
  path: string,
  payload?: RequestPayload,
  responseParser: ResponseParser = 'JSON',
): Promise<ResponsePayload> {
  return universalRequest('DELETE', path, payload, responseParser);
}

/** Issue a PATH request with a JSON payload using either web fetch or Tauri fetch */
export async function universalPatch<ResponsePayload = unknown, RequestPayload = unknown>(
  path: string,
  payload: RequestPayload,
  responseParser: ResponseParser = 'JSON',
): Promise<ResponsePayload> {
  return universalRequest('PATCH', path, payload, responseParser);
}

/** Issue a FILE Upload using either web fetch or Tauri fetch */
export async function universalPutFile(path: string, filePath: string, content: string | ArrayBuffer) {
  const data = new FormData();
  const file = new File([content], filePath);
  data.append('file', file);
  return universalRequest('PUT', path, data);
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
  method: HttpMethod,
  path: string,
  payload?: RequestPayload,
  responseParser: ResponseParser = 'JSON',
): Promise<ResponsePayload> {
  if (import.meta.env.VITE_IS_WEB) {
    return makeWebRequest<ResponsePayload, RequestPayload>(method, path, payload, responseParser);
  } else {
    return makeTauriRequest<ResponsePayload, RequestPayload>(path, method, payload, responseParser);
  }
}

if (import.meta.env.DEV) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).universalRequest = universalRequest;
}

async function makeWebRequest<ResponsePayload = unknown, RequestPayload = unknown>(
  method: HttpMethod,
  path: string,
  payload: RequestPayload | undefined,
  responseParser: ResponseParser,
) {
  console.log(`WEB FETCH REQUEST: ${method} ${path}`);
  const headers: HeadersInit =
    payload instanceof FormData
      ? {}
      : {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        };
  const response = await fetch(path, {
    method,
    headers,
    body: payload instanceof FormData ? payload : payload ? JSON.stringify(payload) : undefined,
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
}

async function makeTauriRequest<ResponsePayload = unknown, RequestPayload = unknown>(
  path: string,
  method: HttpMethod,
  payload: RequestPayload | undefined,
  responseParser: ResponseParser,
) {
  // try {
  const url = REFSTUDIO_HOST + path;
  console.log(`TAURI FETCH REQUEST: ${method} ${url}`);
  const body =
    payload instanceof FormData
      ? Body.form(payload) // file upload
      : payload
      ? Body.json(payload)
      : undefined;
  const responseType = responseParser === 'JSON' ? ResponseType.JSON : ResponseType.Binary;
  const response = await tauriFetch(url, {
    method,
    body,
    responseType,
  });
  console.log('TAURI FETCH RESPONSE STATUS', response.status);
  if (!response.ok) {
    throw new Error(`Failed to ${method} ${path}: ${response.status} - ${JSON.stringify(response.data)}`);
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
