import { cx } from '../../lib/cx';

export function EmptyView() {
  return (
    <div className="pointer-events-none flex w-full select-none flex-col items-center justify-center gap-2 bg-slate-300">
      <div className="relative border border-slate-500 text-[160px] font-extrabold">
        <EmptyViewLetter className="bg-slate-500/50 text-slate-200/50" letter="R" />
        <EmptyViewLetter className="bg-slate-200/50 text-slate-500/50" letter="S" />
      </div>

      <div className="mt-10 space-y-4">
        <EmptyViewShortcut keys={['⌘', 'K']} text="Show Commands" />
        <EmptyViewShortcut keys={['⌘', 'R']} text="Show References" />
        <EmptyViewShortcut keys={['⌘', 'N']} text="New File" />
        <EmptyViewShortcut keys={['⌘', ',']} text="Show Settings" />
      </div>
    </div>
  );
}

function EmptyViewShortcut({ text, keys }: { text: string; keys: string[] }) {
  return (
    <div className="flex items-center gap-2">
      <div className=" min-w-[150px] px-1 text-right text-slate-500">{text}</div>
      <div className="flex gap-1">
        {keys.map((key) => (
          <kbd className="rounded-sm bg-slate-500 px-2 py-0.5 font-mono text-slate-200" key={key}>
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}

function EmptyViewLetter({ letter, className = '' }: { letter: string; className?: string }) {
  return (
    <div className={cx('xw-[80px] inline-flex items-center justify-center px-4 text-center', className)}>
      <span>{letter}</span>
    </div>
  );
}
