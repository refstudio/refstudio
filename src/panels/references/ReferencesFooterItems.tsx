import { useAtomValue } from 'jotai';
import { VscLibrary, VscRefresh } from 'react-icons/vsc';

import { getReferencesAtom, referencesSyncInProgressAtom } from '../../atoms/referencesState';
import { FooterItem } from '../../components/footer/FooterItem';

export function ReferencesFooterItems() {
  const syncInProgress = useAtomValue(referencesSyncInProgressAtom);
  const references = useAtomValue(getReferencesAtom);
  return (
    <>
      {syncInProgress && <FooterItem icon={<VscRefresh className="animate-spin" />} text="References ingestion..." />}
      <FooterItem icon={<VscLibrary />} text={`References: ${references.length}`} />
    </>
  );
}
