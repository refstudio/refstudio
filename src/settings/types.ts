export type SettingsPaneId = 'user-account' | 'project-logging' | 'project-ai' | 'debug';

export interface PaneConfig {
  id: SettingsPaneId;
  title: string;
  Pane: React.FC<{ config: PaneConfig }>;
}
export interface SettingsPanesConfig {
  section: string;
  bottom?: boolean;
  hidden?: boolean;
  panes: PaneConfig[];
}
