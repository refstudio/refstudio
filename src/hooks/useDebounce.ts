import * as React from 'react';

export default <T extends any[]>(callback: (...args: T) => any, ms: number) => {
  const timeout = React.useRef<NodeJS.Timeout>();

  return (...args: T) => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    timeout.current = setTimeout(() => callback(...args), ms);
  };
};
