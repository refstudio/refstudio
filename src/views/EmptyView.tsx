import { cx } from '../cx';

export function EmptyView() {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-2 bg-slate-300">
      <div className="relative border border-slate-500 text-8xl font-extrabold">
        <EmptyViewLetter className="bg-slate-500 text-slate-200" letter="R" />
        <EmptyViewLetter className="bg-slate-200 text-slate-500" letter="S" />
      </div>
      <span className="text-sm italic">No file selected.</span>
    </div>
  );
}
function EmptyViewLetter({ letter, className = '' }: { letter: string; className?: string }) {
  return (
    <div className={cx('inline-flex w-[80px] items-center justify-center text-center', className)}>
      <span>{letter}</span>
    </div>
  );
}
