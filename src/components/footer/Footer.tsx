import { ReferencesFooterItems } from '../../features/references/footer/ReferencesFooterItems';
import { FooterNotificationsItem } from '../../notifications/footer/FooterNotificationsItem';

export function Footer() {
  return (
    <div className="relative flex items-center justify-end gap-1 bg-black pl-2 text-white">
      <ReferencesFooterItems />
      <FooterNotificationsItem />
    </div>
  );
}
