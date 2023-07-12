import { createStore } from 'jotai';
import { useEffect, useRef } from 'react';

import { runHookWithJotaiProvider } from '../../__tests__/test-utils';

function createHookWithRendersCount<T>(hook: () => T) {
  return () => {
    const rendersCount = useRef(1);
    const hookResult = hook();

    useEffect(() => {
      rendersCount.current += 1;
    });

    return {
      rendersCount: rendersCount.current,
      hookResult,
    };
  };
}

export function runHookWithRendersCount<T>(hook: () => T, store: ReturnType<typeof createStore>) {
  return runHookWithJotaiProvider(createHookWithRendersCount(hook), store);
}
