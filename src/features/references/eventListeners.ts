import { useSetAtom } from 'jotai';

import { getIngestedReferences } from '../../api/ingestion';
import { setReferencesAtom } from '../../atoms/referencesState';

export function useLoadReferencesListener() {
  const setReferences = useSetAtom(setReferencesAtom);

  return () => {
    (async () => {
      const initialReferences = await getIngestedReferences();
      setReferences(initialReferences);
    })();
  };
}
