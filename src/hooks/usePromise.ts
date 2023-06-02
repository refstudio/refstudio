import React from 'react';

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
export type PromiseState<T> = LoadingState | ErrorState | SuccessState<T>;

/**
 * This presents a synchronous view of an async resource.
 *
 * The async function should be wrapped in React.useCallback to avoid unnecessary renders.
 */
export function usePromise<T>(fn: () => Promise<T>): PromiseState<T> {
  const [val, setVal] = React.useState<PromiseState<T>>({ state: 'loading' });
  const handleSuccess = React.useCallback((data: T) => setVal({ state: 'ok', data }), []);
  const handleError = React.useCallback((error: unknown) => setVal({ state: 'error', error }), []);

  React.useEffect(() => {
    let isMounted = true;
    fn().then(
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
  }, [fn, handleError, handleSuccess]);
  return val;
}
