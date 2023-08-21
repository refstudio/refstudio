import { cx } from '../../lib/cx';

export function Logo() {
  return (
    <div className="flex h-32 w-64 shrink-0 flex-row overflow-hidden rounded-default shadow-default">
      <LogoLetter className="bg-grayscale-90 text-grayscale-0" letter="R" />
      <LogoLetter className="bg-grayscale-0 text-grayscale-90" letter="S" />
    </div>
  );
}

function LogoLetter({ letter, className = '' }: { letter: string; className?: string }) {
  return (
    <div className={cx('flex flex-1 items-center justify-center text-8xl font-black', className)}>
      <span>{letter}</span>
    </div>
  );
}
