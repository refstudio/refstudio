import { atom } from 'jotai';

export const debugAtom = () => {
  const fn = vi.fn();
  return atom(
    () => fn,
    (_, __, ...args) => void fn(...args),
  );
};

export interface DebugAtomModuleType {
  debugAtom: typeof debugAtom;
}
