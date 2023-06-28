import { useAtomValue } from 'jotai';

import { referencesSyncInProgressAtom } from '../../atoms/referencesState';
import { emitEvent, RefStudioEvents } from '../../events';

export function UploadTipInstructions() {
  const syncInProgress = useAtomValue(referencesSyncInProgressAtom);

  if (syncInProgress) {
    return null;
  }

  return (
    <div className="my-2 bg-yellow-50 p-1 text-sm italic" data-testid={UploadTipInstructions.name}>
      <strong>TIP:</strong> Click{' '}
      <span className="cursor-pointer underline" onClick={() => emitEvent(RefStudioEvents.menu.references.upload)}>
        here
      </span>{' '}
      or drag/drop PDF files for upload.
    </div>
  );
}
