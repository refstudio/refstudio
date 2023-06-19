export function noop<T = void>() {
  return () =>
    // no code!
    0 as T;
}
