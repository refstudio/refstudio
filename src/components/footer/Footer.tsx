import { ReferencesFooterItems } from '../../panels/references/ReferencesFooterItems';

export function Footer() {
  return (
    <div className="h-10x flex items-center justify-end gap-2 border-t border-t-slate-100 bg-black px-2 text-white">
      <ReferencesFooterItems />
    </div>
  );
}
