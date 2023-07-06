import { ReferencesFooterItems } from '../../features/references/footer/ReferencesFooterItems';

export function Footer() {
  return (
    <div className="flex items-center justify-end gap-2 bg-black px-2 text-white">
      <ReferencesFooterItems />
    </div>
  );
}
