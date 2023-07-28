import { useAtomValue } from 'jotai';
import { VscHome } from 'react-icons/vsc';

import { projectPathAtom } from '../../atoms/projectState';
import { ReferencesFooterItems } from '../../features/references/footer/ReferencesFooterItems';
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
  const projectDir = useAtomValue(projectPathAtom);
  return <>{projectDir && <FooterItem className="mr-auto" icon={<VscHome />} text={projectDir} />}</>;
}
