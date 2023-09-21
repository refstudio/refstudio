import { useEffect, useState } from 'react';
import { VscCheck, VscCloud, VscRefresh } from 'react-icons/vsc';

import { useSomeEditorIsBeingSaved } from '../../../atoms/hooks/useSomeEditorIsBeingSaved';
import { FooterItem } from '../../../components/footer/FooterItem';

export function FooterSavingFilesItem() {
  const [showSaved, setShowSaved] = useState(false);
  const someDirty = useSomeEditorIsBeingSaved();

  useEffect(() => {
    // Note: We know this will show the "All files saved" info in the first run. That's ok.
    if (!someDirty) {
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 1000);
    }
  }, [someDirty]);

  if (someDirty) {
    return <FooterItem icon={<VscRefresh className="animate-spin" />} text="Saving..." />;
  }

  if (showSaved) {
    return (
      <FooterItem
        icon={
          <span className="relative inline-flex">
            <VscCloud size={20} />
            <VscCheck className="absolute left-[6px] top-[3px]" size={10} />
          </span>
        }
        text="Saved"
      />
    );
  }

  return null;
}
