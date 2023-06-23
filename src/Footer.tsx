import { useAtomValue } from 'jotai';
import React from 'react';
import { VscLibrary, VscRefresh } from 'react-icons/vsc';

import { getReferencesAtom, referencesSyncInProgressAtom } from './atoms/referencesState';

export function Footer() {
  return (
    <div className="h-10x flex items-center justify-end gap-2 border-t border-t-slate-100 bg-black px-2 text-white">
      <ReferencesFooterItems />
    </div>
  );
}

function ReferencesFooterItems() {
  const syncInProgress = useAtomValue(referencesSyncInProgressAtom);
  const references = useAtomValue(getReferencesAtom);
  return (
    <>
      {syncInProgress && <FooterItem icon={<VscRefresh className="animate-spin" />} text="References ingestion..." />}
      <FooterItem icon={<VscLibrary />} text={`References: ${references.length}`} />
    </>
  );
}

function FooterItem({ icon, text }: { icon: React.ReactNode; text: string; loading?: boolean }) {
  return (
    <span className="flex cursor-pointer items-center gap-2 px-2 py-1 hover:bg-slate-700">
      {icon} <span>{text}</span>
    </span>
  );
}
