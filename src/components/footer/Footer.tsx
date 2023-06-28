import { ReferencesFooterItems } from '../../references/footer/ReferencesFooterItems';

export function Footer() {
  return (
    <div className="flex items-center justify-end gap-2 border-t border-t-slate-100 bg-black px-2 text-white">
      <ReferencesFooterItems />
    </div>
  );
}
