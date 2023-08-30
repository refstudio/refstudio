import { Body, fetch as tauriFetch, ResponseType } from '@tauri-apps/api/http';

import { paths } from './raw-api-types';
import { REFSTUDIO_HOST } from './server';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type LowerMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';
type ResponseParser = 'JSON' | 'ArrayBuffer';

type Unionize<T> = { [k in keyof T]: { k: k; v: T[k] } }[keyof T];
type ExtractPathsForMethod<T, Method extends LowerMethod> = T extends { k: infer Path; v: Record<Method, unknown> }
  ? Path
  : never;
type PathsForMethod<Method extends LowerMethod> = ExtractPathsForMethod<Unionize<paths>, Method>;

type ParamsFor<Path extends keyof paths, Method extends LowerMethod> = paths extends Record<
  Path,
  Record<Method, { parameters: infer Params }>
>
  ? Params
  : never;

type JsonResponseFor<Path extends keyof paths, Method extends LowerMethod> = paths extends Record<
  Path,
  Record<Method, { responses: { 200: { content: { 'application/json': infer ResponseType } } } }>
>
  ? ResponseType
  : never;

type JsonRequestBodyFor<Path extends keyof paths, Method extends LowerMethod> = paths extends Record<
  Path,
  Record<Method, { requestBody: { content: { 'application/json': infer RequestBody } } }>
>
  ? RequestBody
  : never;

type PathArgs<Path extends keyof paths, Method extends LowerMethod> = [ParamsFor<Path, Method>] extends [never]
  ? []
  : [options: ParamsFor<Path, Method>];

/** Issue a GET request using either web fetch or Tauri fetch */
export async function universalGet<ResponsePayload = unknown>(
  path: string,
  responseParser: ResponseParser = 'JSON',
): Promise<ResponsePayload> {
  return universalRequest<ResponsePayload>('GET', path, undefined, responseParser);
}

interface RouteParameters {
  path?: Record<string, string>;
  query?: Record<string, string>;
}

function completePath(path: string, params: RouteParameters) {
  if (params.path) {
    for (const [key, value] of Object.entries(params.path)) {
      path = path.replace('{' + key + '}', value);
    }
  }
  if (params.query) {
    path += '?' + new URLSearchParams(params.query).toString();
  }
  return path;
}

export async function apiGetJson<Path extends PathsForMethod<'get'>>(pathSpec: Path, ...args: PathArgs<Path, 'get'>) {
  const options = (args as unknown[])[0] as RouteParameters | undefined;
  const path = options ? completePath(pathSpec, options) : pathSpec;
  console.log('apiGetJSON', pathSpec, path);
  type ResponseType = JsonResponseFor<Path, 'get'>;
  return universalRequest<ResponseType>('GET', path, undefined);
}

export async function apiPost<Path extends PathsForMethod<'post'>>(
  pathSpec: Path,
  ...args: [...params: PathArgs<Path, 'post'>, body: JsonRequestBodyFor<Path, 'post'>]
) {
  const safeArgs = args as unknown as [params: RouteParameters, body: unknown] | [body: unknown];
  const [options, body] = safeArgs.length === 2 ? safeArgs : [undefined, ...safeArgs];
  const path = options ? completePath(pathSpec, options) : pathSpec;
  console.log('apiPostJSON', pathSpec, path);
  type ResponseType = JsonResponseFor<Path, 'post'>;
  return universalPost<ResponseType>(path, body);
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

/** Issue a PATCH request with a JSON payload using either web fetch or Tauri fetch */
export async function universalPatch<ResponsePayload = unknown, RequestPayload = unknown>(
  path: string,
  payload: RequestPayload,
  responseParser: ResponseParser = 'JSON',
): Promise<ResponsePayload> {
  return universalRequest('PATCH', path, payload, responseParser);
}

/**
 * Issue a HEAD request using either web fetch or Tauri fetch
 *
 * @param path a request url
 * @returns the HTTP response status code
 * */
export async function universalHead(path: string): Promise<number> {
  if (import.meta.env.VITE_IS_WEB) {
    const response = await fetch(path, { method: 'HEAD' });
    return response.status;
  } else {
    const response = await tauriFetch(REFSTUDIO_HOST + path, { method: 'HEAD' });
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
  const url = REFSTUDIO_HOST + path;
  const responseType = responseParser === 'JSON' ? ResponseType.JSON : ResponseType.Binary;
  const response = await tauriFetch(url, {
    method,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    body: payload ? Body.json(payload as any) : undefined,
    responseType,
  });
  if (!response.ok) {
    throw new Error(`Failed to ${method} ${path}: ${response.status} - ${JSON.stringify(response.data)}`);
  }
  switch (responseParser) {
    case 'JSON':
      return response.data as ResponsePayload;
    case 'ArrayBuffer':
      return response.data as ResponsePayload;
  }
}

/** Issue a FILE Upload using either web fetch or Tauri fetch */
export async function universalPutFile(path: string, filePath: string, content: string | ArrayBuffer) {
  if (import.meta.env.VITE_IS_WEB) {
    const formData = new FormData();
    formData.append('file', new File([content], filePath));
    return fetch(path, { method: 'PUT', body: formData });
  }

  // TAURI
  const url = REFSTUDIO_HOST + path;
  const buffer = typeof content === 'string' ? new TextEncoder().encode(content) : new Uint8Array(content);
  const body = Body.form({
    file: {
      // either a path or an array buffer of the file contents.
      // We can't use a path bc Tauri check if file exists and has read permissions. Also, will send the file content.
      file: buffer,
      // optional (as defined in the documentation)
      // We need to send a value bc is a mandatory field for the backend API
      fileName: filePath,
    },
  });
  await tauriFetch(url, {
    method: 'PUT',
    body,
    headers: {
      // Note that this is a mandatory header when sending binary content
      'Content-Type': 'multipart/form-data',
    },
  });
}
