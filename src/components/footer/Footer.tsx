import { ReferencesFooterItems } from '../../features/references/footer/ReferencesFooterItems';
import { FooterNotificationItems } from '../../notifications/footer/FooterNotificationItems';

export function Footer() {
  return (
    <div className="relative flex items-center justify-end gap-1 bg-black pl-2 text-white">
      <ReferencesFooterItems />
      <FooterNotificationItems />
    </div>
  );
}
