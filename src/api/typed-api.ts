/** Type-safe access to the RefStudio HTTP APIs. */

import { EventStreamContentType, fetchEventSource } from '@microsoft/fetch-event-source';

import { universalDelete, universalGet, universalPatch, universalPost, universalPut } from './api';
import type { paths } from './api-paths';
import { REFSTUDIO_HOST } from './server';

type LowerMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

/** Helper to convert an object to a union of k/v pairs */
type Unionize<T> = { [k in keyof T]: { k: k; v: T[k] } }[keyof T];

type ExtractPathsForMethod<T, Method extends LowerMethod> = T extends { k: infer Path; v: Record<Method, unknown> }
  ? Path
  : never;

/** Get a union of all the paths for a particular HTTP method (get, post, etc.) */
type PathsForMethod<Method extends LowerMethod> = ExtractPathsForMethod<Unionize<paths>, Method>;

/**
 * Get the 'parameters' object for a path / method pair, if it takes parameters.
 *
 * Parameters are path parameters (`/path/{param}`) or search parameters (`?q=search`).
 */
type ParamsFor<Path extends keyof paths, Method extends LowerMethod> = paths extends Record<
  Path,
  Record<Method, { parameters: infer Params }>
>
  ? Params
  : never;

/** Extract the JSON response type for a path/method pair from the paths interface. */
type JsonResponseFor<Path extends keyof paths, Method extends LowerMethod> = paths extends Record<
  Path,
  Record<Method, { responses: { 200: { content: { 'application/json': infer ResponseType } } } }>
>
  ? ResponseType
  : never;

/** Extract the JSON request body type for a path/method pair from the paths interface. */
type JsonRequestBodyFor<Path extends keyof paths, Method extends LowerMethod> = paths extends Record<
  Path,
  Record<Method, { requestBody: { content: { 'application/json': infer RequestBody } } }>
>
  ? RequestBody
  : never;

/** Extract the Stream response type for a path/method pair from the paths interface. */
type StreamResponseFor<Path extends keyof paths, Method extends LowerMethod> = paths extends Record<
  Path,
  Record<Method, { responses: { 200: { content: { 'text/event-stream': infer ResponseType } } } }>
>
  ? ResponseType
  : never;

/**
 * This is used to model how apiGet() takes one argument (the path) if the endpoint has no parameters
 * but two arguments (the path and the parameters) if it does.
 */
type PathArgs<Path extends keyof paths, Method extends LowerMethod> = [ParamsFor<Path, Method>] extends [never]
  ? []
  : [options: ParamsFor<Path, Method>];

/** The type of OpenAPI's parameters interface */
interface RouteParameters {
  path?: Record<string, string>;
  query?: Record<string, string>;
}

/** "Complete" a path by filling in path parameters and appending query parameters. */
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

/**
 * Issue a GET request to a RefStudio API endpoint.
 *
 * If the endpoint has path parameters or allows search parameters, then this will take a second argument.
 */
export async function apiGetJson<Path extends PathsForMethod<'get'>>(pathSpec: Path, ...args: PathArgs<Path, 'get'>) {
  const options = (args as unknown[])[0] as RouteParameters | undefined;
  const path = options ? completePath(pathSpec, options) : pathSpec;
  type ResponseType = JsonResponseFor<Path, 'get'>;
  return universalGet<ResponseType>(path, undefined);
}

/**
 * Issue a POST request with a JSON payload to a RefStudio API endpoint.
 *
 * If the endpoint takes path parameters or search parameters, then that will be the second argument.
 * The last argument (2nd or 3rd argument) is the request body.
 */
export async function apiPost<Path extends PathsForMethod<'post'>>(
  pathSpec: Path,
  ...args: [...params: PathArgs<Path, 'post'>, body: JsonRequestBodyFor<Path, 'post'>]
) {
  const safeArgs = args as unknown as [params: RouteParameters, body: unknown] | [body: unknown];
  const [options, body] = safeArgs.length === 2 ? safeArgs : [undefined, ...safeArgs];
  const path = options ? completePath(pathSpec, options) : pathSpec;
  type ResponseType = JsonResponseFor<Path, 'post'>;
  return universalPost<ResponseType>(path, body);
}

/**
 * Issue a PATCH request with a JSON payload to a RefStudio API endpoint.
 *
 * If the endpoint takes path parameters or search parameters, then that will be the second argument.
 * The last argument (2nd or 3rd argument) is the request body.
 */
export async function apiPatch<Path extends PathsForMethod<'patch'>>(
  pathSpec: Path,
  ...args: [...params: PathArgs<Path, 'patch'>, body: JsonRequestBodyFor<Path, 'patch'>]
) {
  const safeArgs = args as unknown as [params: RouteParameters, body: unknown] | [body: unknown];
  const [options, body] = safeArgs.length === 2 ? safeArgs : [undefined, ...safeArgs];
  const path = options ? completePath(pathSpec, options) : pathSpec;
  type ResponseType = JsonResponseFor<Path, 'patch'>;
  return universalPatch<ResponseType>(path, body);
}

/**
 * Issue a DELETE request to a RefStudio API endpoint.
 *
 * If the endpoint has path parameters or allows search parameters, then this will take a second argument.
 */
export async function apiDelete<Path extends PathsForMethod<'delete'>>(
  pathSpec: Path,
  ...args: PathArgs<Path, 'delete'>
) {
  const options = (args as unknown[])[0] as RouteParameters | undefined;
  const path = options ? completePath(pathSpec, options) : pathSpec;
  type ResponseType = JsonResponseFor<Path, 'delete'>;
  return universalDelete<ResponseType>(path, undefined);
}

/**
 * Issue a PUT request with a JSON payload to a RefStudio API endpoint.
 *
 * If the endpoint takes path parameters or search parameters, then that will be the second argument.
 * The last argument (2nd or 3rd argument) is the request body.
 */
export async function apiPut<Path extends PathsForMethod<'put'>>(
  pathSpec: Path,
  ...args: [...params: PathArgs<Path, 'put'>, body: JsonRequestBodyFor<Path, 'put'>]
) {
  const safeArgs = args as unknown as [params: RouteParameters, body: unknown] | [body: unknown];
  const [options, body] = safeArgs.length === 2 ? safeArgs : [undefined, ...safeArgs];
  const path = options ? completePath(pathSpec, options) : pathSpec;
  type ResponseType = JsonResponseFor<Path, 'post'>;
  return universalPut<ResponseType>(path, body);
}

/**
 * Issue a POST request with a JSON payload to a RefStudio API endpoint that returns a stream of events.
 *
 * If the endpoint takes path parameters or search parameters, then that will be the second argument.
 * The last two arguments (2nd and 3rd argument) are the request body and streaming event callback.
 */
export async function apiPostStream<Path extends PathsForMethod<'post'>>(
  pathSpec: Path,
  ...args: [
    ...params: PathArgs<Path, 'post'>,
    body: JsonRequestBodyFor<Path, 'post'>,
    onMessage: (msg: StreamResponseFor<Path, 'post'>) => void,
  ]
) {
  type ResponseType = StreamResponseFor<Path, 'post'>;
  type StreamingEventCallback = (msg: StreamResponseFor<Path, 'post'>) => void;
  const safeArgs = args as unknown as
    | [params: RouteParameters, body: unknown, onMessage: StreamingEventCallback]
    | [body: unknown, onMessage: StreamingEventCallback];
  const [options, body, onMessage] = safeArgs.length === 3 ? safeArgs : [undefined, ...safeArgs];
  const path = options ? completePath(pathSpec, options) : pathSpec;

  const url = import.meta.env.VITE_IS_WEB ? path : REFSTUDIO_HOST + path;
  return fetchEventSource(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: EventStreamContentType },
    openWhenHidden: false,
    body: JSON.stringify(body),
    // eslint-disable-next-line @typescript-eslint/require-await
    onopen: async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to open event stream: ${response.status} ${response.statusText}`);
      }
      if (!response.headers.get('content-type')?.startsWith(EventStreamContentType)) {
        throw new Error(
          `Expected event stream content type ${EventStreamContentType}, got ${response.headers.get('content-type')}`,
        );
      }
    },

    onclose: () => {
      console.log('Event stream closed');
    },

    onmessage: (msg) => {
      onMessage(msg.data as ResponseType);
    },

    onerror: (err) => {
      console.error('Event stream error', err);
      // Note: This will prevent the stream from reconnecting.
      throw err;
    },
  });
}
