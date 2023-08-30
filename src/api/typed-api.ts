/** Type-safe access to the RefStudio HTTP APIs. */

import { universalGet, universalPost } from './api';
import { paths } from './api-paths';

type LowerMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

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

/**
 * Issue a GET request to a RefStudio API endpoint.
 *
 * If the endpoint has path parameters or allows search parameters, then this will take a second argument.
 */
export async function apiGetJson<Path extends PathsForMethod<'get'>>(pathSpec: Path, ...args: PathArgs<Path, 'get'>) {
  const options = (args as unknown[])[0] as RouteParameters | undefined;
  const path = options ? completePath(pathSpec, options) : pathSpec;
  console.log('apiGetJSON', pathSpec, path);
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
  console.log('apiPostJSON', pathSpec, path);
  type ResponseType = JsonResponseFor<Path, 'post'>;
  return universalPost<ResponseType>(path, body);
}
