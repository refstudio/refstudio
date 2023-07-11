/* c8 ignore next 4 */
/** Use this to assert that a branch is unreachable (for exhaustiveness checking). */
export function assertNever(val: never) {
  throw new Error(`Reached the unreachable: ${val}`);
}
