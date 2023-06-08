import React from 'react';

export interface PendingState {
  state: 'pending';
}

export interface LoadingState {
  state: 'loading';
}
export interface ErrorState {
  state: 'error';
  error: unknown;
}
export interface SuccessState<T> {
  state: 'ok';
  data: T;
}
/** A deferred/promised value can be in one of three states: loading, error or success. */
export type PromiseState<T> = PendingState | LoadingState | ErrorState | SuccessState<T>;

/**
 * This presents a synchronous view of an async resource.
 *
 * The async function should be wrapped in React.useCallback to avoid unnecessary renders.
 */
export function useCallablePromise<R, P extends unknown[]>(fn: (...args: P) => Promise<R>) {
  const [val, setVal] = React.useState<PromiseState<R>>({ state: 'pending' });
  const handleSuccess = React.useCallback((data: R) => setVal({ state: 'ok', data }), []);
  const handleError = React.useCallback((error: unknown) => setVal({ state: 'error', error }), []);

  const [args, setArgs] = React.useState<P | null>(null);

  React.useEffect(() => {
    if (!args) {
      return;
    }
    setVal({ state: 'loading' });
    let isMounted = true;
    fn(...args).then(
      (v) => {
        if (isMounted) {
          handleSuccess(v);
        }
      },
      (error) => {
        if (isMounted) {
          handleError(error);
        }
      },
    );
    return () => {
      isMounted = false;
    };
  }, [fn, args, handleError, handleSuccess]);

  const executor = React.useCallback((...a: P) => {
    setArgs(a);
  }, []);

  return [val, executor] as const;
}
