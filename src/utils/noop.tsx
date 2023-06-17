export function noop<T = void>() {
  return () =>
    // no code!
    0 as T;
}

export function noopPromise<T = void>() {
  return async () => Promise.resolve<T>(0 as T);
}
