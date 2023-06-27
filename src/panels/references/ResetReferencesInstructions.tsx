import { useAtomValue, useSetAtom } from 'jotai';

import { getReferencesAtom, referencesSyncInProgressAtom, setReferencesAtom } from '../../atoms/referencesState';

export function ResetReferencesInstructions() {
  const references = useAtomValue(getReferencesAtom);
  const setReferences = useSetAtom(setReferencesAtom);
  const syncInProgress = useAtomValue(referencesSyncInProgressAtom);
  if (!import.meta.env.DEV) {
    return null;
  }
  if (references.length === 0) {
    return null;
  }
  if (syncInProgress) {
    return null;
  }

  return (
    <div className="mt-10 text-right text-xs ">
      <button className="text-gray-400 hover:underline" onClick={() => setReferences([])}>
        DEBUG: reset references store
      </button>
    </div>
  );
}
