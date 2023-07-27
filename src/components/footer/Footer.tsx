import { VscHome } from 'react-icons/vsc';

import { ReferencesFooterItems } from '../../features/references/footer/ReferencesFooterItems';
import { getProjectBaseDir } from '../../io/filesystem';
import { FooterNotificationItems } from '../../notifications/footer/FooterNotificationItems';
import { FooterItem } from './FooterItem';

export function Footer() {
  return (
    <div className="relative flex items-center justify-end gap-1 bg-black pl-2 text-white">
      <ProjectFooterItems />
      <ReferencesFooterItems />
      <FooterNotificationItems />
    </div>
  );
}

function ProjectFooterItems() {
  const projectDir = getProjectBaseDir();

  return (
    <>
      <FooterItem className="mr-auto" icon={<VscHome />} text={projectDir} />
    </>
  );
}
