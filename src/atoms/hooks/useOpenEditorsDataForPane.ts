import { useAtomValue } from 'jotai';
import { selectAtom } from 'jotai/utils';
import { useCallback, useMemo } from 'react';

import { areStringArraysEqual } from '../../lib/areStringArraysEqual';
import { isNonNullish } from '../../lib/isNonNullish';
import { editorsDataAtom } from '../core/editorData';
import { paneGroupAtom } from '../core/paneGroup';
import { EditorData } from '../types/EditorData';
import { PaneId } from '../types/PaneGroup';

/** Returns the open editors data for a given pane */
export function useOpenEditorsDataForPane(paneId: PaneId): EditorData[] {
  // Get array of editor ids
  const openEditorIds = useAtomValue(
    selectAtom(
      paneGroupAtom,
      useCallback((paneGroup) => paneGroup[paneId].openEditorIds, [paneId]),
      areStringArraysEqual,
    ),
  );

  // Get array of open editors that is only updated when the data of one of the open editors is updated
  return useAtomValue(
    useMemo(
      () =>
        selectAtom(
          editorsDataAtom,
          (editorsData) => openEditorIds.map((editorId) => editorsData.get(editorId)).filter(isNonNullish),
          (editorsDataA, editorsDataB) =>
            editorsDataA.length === editorsDataB.length &&
            editorsDataA.every((editorData, index) => areEditorsDataEqual(editorData, editorsDataB[index])),
        ),
      [openEditorIds],
    ),
  );
}

function areEditorsDataEqual(editorDataA: EditorData, editorDataB: EditorData) {
  return (
    editorDataA.id === editorDataB.id &&
    editorDataA.isDirty === editorDataB.isDirty &&
    editorDataA.title === editorDataB.title
  );
}
