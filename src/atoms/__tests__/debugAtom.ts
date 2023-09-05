import { atom } from 'jotai';

const spies: Record<string, unknown | undefined> = {};

export const makeDebugAtom = (name: string) => {
  const fn = vi.fn();
  spies[name] = fn;
  return atom(null, (_, __, ...args) => {
    fn(...args);
  });
};

export const getDebugAtomSpy = (name: string) => {
  const spy = spies[name];
  if (!spy) {
    throw new Error(`Atom spy function ${name} not found`);
  }
  return spy;
};
