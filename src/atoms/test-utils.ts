import { renderHook } from '@testing-library/react-hooks';
import { Atom, createStore, useAtomValue, useSetAtom, WritableAtom } from 'jotai';

export function runGetAtomHook<T>(atom: Atom<T>, store: ReturnType<typeof createStore>) {
  return renderHook(() => useAtomValue(atom, { store })).result;
}

export function runSetAtomHook<Value, Args extends unknown[], Result>(
  atom: WritableAtom<Value, Args, Result>,
  store: ReturnType<typeof createStore>,
) {
  return renderHook(() => useSetAtom(atom, { store })).result;
}
