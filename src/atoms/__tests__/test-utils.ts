import { renderHook } from '@testing-library/react';
import { Atom, createStore, useAtomValue, useSetAtom, WritableAtom } from 'jotai';

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
    } else if (store.get(fileExplorerEntry.collapsedAtom)) {
      return `${' '.repeat(indent)}> ${fileExplorerEntry.name} (${children.length})`;
    } else {
      return `${' '.repeat(indent)}v ${fileExplorerEntry.name}\n${children
        .map((child) => stringifyFileExplorerState(child, store, indent + 2))
        .join('\n')}`;
    }
  }
}
