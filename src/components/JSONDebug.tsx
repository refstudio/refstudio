import { cx } from '../cx';

export function JSONDebug<T>({ header, value }: { header?: string; value: T }) {
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <pre className="debug-widget border border-slate-200 bg-slate-50 p-4 text-xs opacity-50 hover:opacity-100">
      {header && <strong className="mb-2 block">{header}</strong>}
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export function JSONDebugContainer({ className = '', children }: { className?: string; children: React.ReactNode }) {
  if (!import.meta.env.DEV) {
    return null;
  }
  return <div className={cx('space-y-8 ', className)}>{children}</div>;
}
