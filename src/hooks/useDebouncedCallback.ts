import { useCallback, useRef } from 'react';

/**
 * Returns a callback that will only call the passed function when it has not been called for the specified time
 * @param func The function to be called
 * @param ms The debounce time
 * @returns The debounced callback
 */
export function useDebouncedCallback<T extends unknown[]>(
  func: (...args: T) => void,
  ms: number,
): (...args: T) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: T) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        func(...args);
      }, ms);
    },
    [func, ms],
  );
}
