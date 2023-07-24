import { cx } from '../lib/cx';

export function JSONDebug<T>({ header, value, maskedKeys = [] }: { header?: string; value: T; maskedKeys?: string[] }) {
  if (!import.meta.env.DEV) {
    return null;
  }

  const output = value ? JSON.stringify(value, null, 2) : '';

  let maskedOutput = output;
  maskedKeys.forEach((maskedKey) => {
    maskedOutput = maskedOutput.replace(new RegExp(`"(${maskedKey})": (...).*(.....),`, 'ig'), '"$1": $2***********$3');
  });

  return (
    <pre className="debug-widget border border-slate-200 bg-slate-50 p-4 text-xs opacity-50 hover:opacity-100">
      {header && <strong className="mb-2 block">{header}</strong>}
      {maskedOutput}
    </pre>
  );
}

export function JSONDebugContainer({ className = '', children }: { className?: string; children: React.ReactNode }) {
  if (!import.meta.env.DEV) {
    return null;
  }
  return <div className={cx('space-y-8 ', className)}>{children}</div>;
}
