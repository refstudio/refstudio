import { cx } from '../../lib/cx';

export function WelcomeView({ hideShortcuts, className }: { hideShortcuts?: boolean; className?: string }) {
  return (
    <div
      className={cx(
        'pointer-events-none select-none',
        'flex w-full  flex-col items-center justify-center gap-2',
        'bg-slate-300',
        className,
      )}
    >
      <div className="relative border border-slate-500 bg-slate-300 text-[160px] font-extrabold leading-none">
        <WelcomeViewLetter className="bg-slate-500/50 text-slate-200/50" letter="R" />
        <WelcomeViewLetter className="bg-slate-200/50 text-slate-500/50" letter="S" />
      </div>

      {!hideShortcuts && (
        <div className="mt-10 space-y-4">
          <WelcomeViewShortcut keys={['⌘', 'K']} text="Show Commands" />
          <WelcomeViewShortcut keys={['⌘', 'R']} text="Show References" />
          <WelcomeViewShortcut keys={['⌘', 'N']} text="New File" />
          <WelcomeViewShortcut keys={['⌘', ',']} text="Show Settings" />
        </div>
      )}
    </div>
  );
}

function WelcomeViewShortcut({ text, keys }: { text: string; keys: string[] }) {
  return (
    <div className="flex items-center gap-2">
      <div className="min-w-[135px] px-1 text-right text-slate-500">{text}</div>
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

function WelcomeViewLetter({ letter, className = '' }: { letter: string; className?: string }) {
  return (
    <div className={cx('inline-flex items-center justify-center px-4 text-center', className)}>
      <span>{letter}</span>
    </div>
  );
}
