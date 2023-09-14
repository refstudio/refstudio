import { cx } from '../../lib/cx';

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <div
      className={cx('flex shrink-0 flex-row overflow-hidden rounded-default shadow-default', {
        'h-16 w-32': small,
        'h-32 w-64': !small,
      })}
    >
      <LogoLetter className="bg-logo-primary text-logo-secondary" letter="R" small={small} />
      <LogoLetter className="bg-logo-secondary text-logo-primary" letter="S" small={small} />
    </div>
  );
}

function LogoLetter({
  letter,
  className = '',
  small = false,
}: {
  letter: string;
  className?: string;
  small?: boolean;
}) {
  return (
    <div
      className={cx(
        'flex flex-1 items-center justify-center font-black',
        {
          'text-5xl': small,
          'text-8xl': !small,
        },
        className,
      )}
    >
      <span>{letter}</span>
    </div>
  );
}
