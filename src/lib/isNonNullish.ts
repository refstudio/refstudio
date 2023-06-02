export function isNonNullish<T>(x: T): x is Exclude<T, null | undefined> {
  return x !== null && x !== undefined;
}
