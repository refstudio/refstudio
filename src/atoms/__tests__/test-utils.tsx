import { Atom, createStore, Provider, useAtomValue, useSetAtom, WritableAtom } from 'jotai';

import { renderHook } from '../../test/test-utils';
import { FileExplorerEntry } from '../types/FileExplorerEntry';

export function runGetAtomHook<T>(atom: Atom<T>, store: ReturnType<typeof createStore>) {
  return renderHook(() => useAtomValue(atom, { store })).result;
}

export function runSetAtomHook<Value, Args extends unknown[], Result>(
  atom: WritableAtom<Value, Args, Result>,
  store: ReturnType<typeof createStore>,
) {
  return renderHook(() => useSetAtom(atom, { store })).result;
}

export function runHookWithJotaiProvider<T>(hook: () => T, store: ReturnType<typeof createStore>) {
  const wrapper = ({ children }: { children: React.ReactNode }) => <Provider store={store}>{children}</Provider>;
  return renderHook(hook, { wrapper }).result;
}

export function stringifyFileExplorerState(
  fileExplorerEntry: FileExplorerEntry,
  store: ReturnType<typeof createStore>,
  indent = 0,
): string {
  if (!fileExplorerEntry.isFolder) {
    return ' '.repeat(indent) + fileExplorerEntry.name;
  } else {
    const children = store.get(fileExplorerEntry.childrenAtom);
    if (fileExplorerEntry.root) {
      return `\n${children.map((child) => stringifyFileExplorerState(child, store)).join('\n')}\n`;
    } else {
      const arrowCharacter = store.get(fileExplorerEntry.collapsedAtom) ? '>' : 'v';
      const hasChildren = children.length > 0;
      return `${' '.repeat(indent)}${arrowCharacter} ${fileExplorerEntry.name}${hasChildren ? '\n' : ''}${children
        .map((child) => stringifyFileExplorerState(child, store, indent + 2))
        .join('\n')}`;
    }
  }
}
