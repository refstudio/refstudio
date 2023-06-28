import { PaneConfig } from './../types';

export interface SettingsPaneProps {
  config: PaneConfig;
}

export function SettingsPane({
  config,
  header,
  description = '',
  children,
}: {
  config: PaneConfig;
  header: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div data-testid={config.id}>
      <div className="mb-6">
        <strong className="block border-b-2 border-b-slate-200 pb-1 text-2xl">{header}</strong>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      {children}
    </div>
  );
}
