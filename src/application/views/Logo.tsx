import { cx } from '../../lib/cx';

export function Logo() {
  return (
    <div className="flex flex-row rounded-default h-32 w-64 shadow-default shrink-0 overflow-hidden">
      <LogoLetter className='bg-grayscale-90 text-grayscale-0' letter="R" />
      <LogoLetter className='bg-grayscale-0 text-grayscale-90' letter="S" />
    </div>);
}


function LogoLetter({ letter, className = '' }: { letter: string; className?: string }) {
  return (
    <div className={cx('flex justify-center items-center flex-1 text-8xl font-black', className)}>
      <span>{letter}</span>
    </div>
  );
}