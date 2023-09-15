import { useEffect } from 'react';
import { VscCloud, VscCloudUpload } from 'react-icons/vsc';

import { useOpenEditorsDataForPane } from '../../atoms/hooks/useOpenEditorsDataForPane';
import { emitEvent } from '../../events';
import { ReferencesFooterItems } from '../../features/references/footer/ReferencesFooterItems';
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback';
import { FooterNotificationItems } from '../../notifications/footer/FooterNotificationItems';
import { FooterItem } from './FooterItem';

export function Footer() {
  return (
    <div className="relative flex items-center justify-end gap-1 bg-black pl-2 text-white">
      <FooterSavingFilesItem />
      <ReferencesFooterItems />
      <FooterNotificationItems />
    </div>
  );
}

function FooterSavingFilesItem() {
  const openEditorsDataLeft = useOpenEditorsDataForPane('LEFT');
  const openEditorsDataRight = useOpenEditorsDataForPane('RIGHT');

  const totalDirty =
    openEditorsDataLeft.reduce((acc, curr) => acc + (curr.isDirty ? 1 : 0), 0) +
    openEditorsDataRight.reduce((acc, curr) => acc + (curr.isDirty ? 1 : 0), 0);

  const saveDebounced = useDebouncedCallback(() => {
    emitEvent('refstudio://menu/file/save');
  }, 1000);

  useEffect(() => {
    if (totalDirty > 0) {
      saveDebounced();
    }
  }, [totalDirty, saveDebounced]);

  if (totalDirty > 0) {
    return <FooterItem className="bg-[#54595F]" icon={<VscCloudUpload />} text="Saving file..." />;
  }

  return <FooterItem icon={<VscCloud />} text="All files saved" />;
}
