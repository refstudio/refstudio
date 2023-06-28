import { JSONDebug, JSONDebugContainer } from '../../components/JSONDebug';
import { getSettings } from '../settings';
import { SettingsPane, SettingsPaneProps } from './SettingsPane';

export function DebugSettingsPane({ config }: SettingsPaneProps) {
  return (
    <SettingsPane config={config} header={config.title}>
      <JSONDebugContainer>
        <JSONDebug header="DEFAULT SETTINGS" value={getSettings().default} />
        <JSONDebug header="CURRENT SETTINGS" value={getSettings()} />
      </JSONDebugContainer>
    </SettingsPane>
  );
}
