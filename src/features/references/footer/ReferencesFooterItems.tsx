import { useAtomValue, useSetAtom } from 'jotai';
import { VscLibrary, VscRefresh } from 'react-icons/vsc';

import { openReferencesAtom } from '../../../atoms/editorActions';
import { getReferencesAtom, referencesSyncInProgressAtom } from '../../../atoms/referencesState';
import { FooterItem } from '../../../components/footer/FooterItem';
import { emitEvent } from '../../../events';
import { useListenEvent } from '../../../hooks/useListenEvent';

export function ReferencesFooterItems() {
  const syncInProgress = useAtomValue(referencesSyncInProgressAtom);
  const references = useAtomValue(getReferencesAtom);
  const openReferences = useSetAtom(openReferencesAtom);

  useListenEvent('refstudio://menu/references/open', openReferences);

  return (
    <>
      {syncInProgress && <FooterItem icon={<VscRefresh className="animate-spin" />} text="References ingestion..." />}
      <FooterItem
        icon={<VscLibrary />}
        text={`References: ${references.length}`}
        onClick={() => emitEvent('refstudio://menu/references/open')}
      />
    </>
  );
}
