import { useAtomValue } from 'jotai';
import { selectAtom } from 'jotai/utils';
import { useMemo } from 'react';

import { areStringArraysEqual } from '../../lib/areStringArraysEqual';
import { isNonNullish } from '../../lib/isNonNullish';
import { editorsDataAtom } from '../core/editorData';
import { paneGroupAtom } from '../core/paneGroup';
import { EditorData } from '../types/EditorData';
import { PaneId } from '../types/PaneGroup';

/** Returns the count of open editors for a given pane */
export function usePaneOpenEditorsData(paneId: PaneId): EditorData[] {
  // Get array of editor ids
  const openEditorIdsAtom = useMemo(
    () => selectAtom(paneGroupAtom, (paneGroup) => paneGroup[paneId].openEditorIds, areStringArraysEqual),
    [paneId],
  );
  const openEditorIds = useAtomValue(openEditorIdsAtom);

  // Get array of open editors that is only updated when the data of one of the open editors is updated
  const openEditorsDataAtom = useMemo(
    () =>
      selectAtom(
        editorsDataAtom,
        (editorsData) => openEditorIds.map((editorId) => editorsData.get(editorId)).filter(isNonNullish),
        (editorsDataA, editorsDataB) =>
          editorsDataA.length === editorsDataB.length &&
          editorsDataA.every((editorData, index) => areEditorsDataEqual(editorData, editorsDataB[index])),
      ),
    [openEditorIds],
  );

  return useAtomValue(openEditorsDataAtom);
}

function areEditorsDataEqual(editorDataA: EditorData, editorDataB: EditorData) {
  return (
    editorDataA.id === editorDataB.id &&
    editorDataA.isDirty === editorDataB.isDirty &&
    editorDataA.title === editorDataB.title
  );
}
