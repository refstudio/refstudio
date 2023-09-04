import { useEffect, useState } from 'react';

import { Button } from '../../components/Button';
import { PaneConfig } from '../types';

export interface SettingsPaneProps {
  config: PaneConfig;
}

interface SavableSettingsPaneProps {
  config: PaneConfig;
  header: string;
  children: React.ReactNode;
  isDirty: boolean;
  onSave: () => void;
}
interface UnsavableSettingsPaneProps {
  config: PaneConfig;
  header: string;
  children: React.ReactNode;
  isDirty?: undefined;
  onSave?: undefined;
}
export function SettingsPane({
  config,
  header,
  children,
  isDirty,
  onSave,
}: SavableSettingsPaneProps | UnsavableSettingsPaneProps) {
  const [isSaved, setSaved] = useState(false);
  useEffect(() => {
    if (isDirty) {
      setSaved(false);
    }
  }, [isDirty]);

  return (
    <div className="flex h-full w-full flex-col items-stretch justify-between p-6" data-testid={config.id}>
      <div className="flex flex-col items-stretch gap-6 overflow-hidden">
        <h1 className="text-modal-txt-secondary">{header}</h1>
        <div className="flex flex-col items-stretch gap-6 overflow-scroll">{children}</div>
      </div>
      {!!onSave && (
        <div className="flex justify-end">
          <div className="shrink">
            <Button
              disabled={!isDirty}
              size="M"
              text={isSaved ? 'Saved!' : 'Save'}
              onClick={() => {
                setSaved(true);
                onSave();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
