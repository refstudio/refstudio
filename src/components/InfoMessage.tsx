import { cx } from '../lib/cx';

export function InfoMessage({ children, className, ...props }: React.HtmlHTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'rounded-md border border-solid border-blue-400 bg-blue-50 p-1 text-sm italic text-slate-500',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
