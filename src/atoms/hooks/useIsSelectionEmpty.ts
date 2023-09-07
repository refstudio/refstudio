import { useAtomValue } from 'jotai';
import { selectAtom } from 'jotai/utils';
import { useMemo } from 'react';

import { selectionAtom } from '../selectionState';

export function useIsSelectionEmpty() {
  const isSelectionEmptyAtom = useMemo(() => selectAtom(selectionAtom, selection => selection.length === 0), []);

  return useAtomValue(isSelectionEmptyAtom);
}