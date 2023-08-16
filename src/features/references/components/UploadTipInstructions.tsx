import { useAtomValue } from 'jotai';

import { referencesSyncInProgressAtom } from '../../../atoms/referencesState';
import { InfoMessage } from '../../../components/InfoMessage';
import { emitEvent } from '../../../events';

export function UploadTipInstructions() {
  const syncInProgress = useAtomValue(referencesSyncInProgressAtom);

  if (syncInProgress) {
    return null;
  }

  return (
    <InfoMessage className="m-4 " data-testid={UploadTipInstructions.name}>
      <strong>TIP:</strong> Click{' '}
      <span className="cursor-pointer underline" onClick={() => emitEvent('refstudio://menu/references/upload')}>
        here
      </span>{' '}
      or drag/drop PDF files for upload.
    </InfoMessage>
  );
}
