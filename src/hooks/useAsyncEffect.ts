import React from 'react';

/**
 * Utility effect for async operations with support for destroy
 *
 * Note: Implementation based on https://github.com/rauldeheer/use-async-effect
 *
 * @param effect async effect function with a parameter function to query mount status. The returned value will be sent to the destroy function
 * @param destroy an optional destroy function to release resources
 * @param inputs optional dependency list
 * @param onError optional error callback for the async effect
 */
export function useAsyncEffect<V, E>(
  effect: (isMounted: () => boolean) => V | Promise<V>,
  destroy?: (result: V) => void,
  inputs?: unknown[],
  onError?: (err: E) => void,
): void {
  const hasDestroy = typeof destroy === 'function';

  React.useEffect(() => {
    let effectResult: V | undefined;
    let mounted = true;
    const maybePromise = effect(() => mounted);

    Promise.resolve(maybePromise)
      .then((_effectResult) => (effectResult = _effectResult))
      .catch((err: E) => onError?.(err));

    return () => {
      mounted = false;

      if (hasDestroy && effectResult !== undefined) {
        destroy(effectResult);
      }
    };
  }, [destroy, effect, hasDestroy, inputs, onError]);
}
