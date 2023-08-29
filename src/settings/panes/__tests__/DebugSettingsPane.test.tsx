import { SettingsManager } from 'tauri-settings';

import { render, screen } from '../../../test/test-utils';
import { getSettings, initSettings, saveCachedSettings, SettingsSchema } from '../../settingsManager';
import { PaneConfig } from '../../types';
import { DebugSettingsPane } from '../DebugSettingsPane';
import { GeneralSettingsPane } from '../GeneralSettingsPane';

vi.mock('../../settingsManager');
vi.mock('../../../events');

const panelConfig: PaneConfig = {
  id: 'project-general',
  Pane: GeneralSettingsPane,
  title: 'OPEN AI',
};

const mockSettings: SettingsSchema = {
  project: {
    current_directory: 'app-dir',
  },
  openai: {
    api_key: '',
    chat_model: 'gpt-3.5-turbo',
    manner: 'concise',
    temperature: 0.7,
  },
  sidecar: {
    logging: {
      enable: true,
      filepath: '/tmp',
    },
  },
};

describe('DebugSettingsPane component', () => {
  beforeEach(() => {
    // Fake settings methods
    vi.mocked(initSettings).mockResolvedValue();
    vi.mocked(saveCachedSettings).mockResolvedValue();
    // eslint-disable-next-line
    vi.mocked(getSettings).mockResolvedValue({
      default: mockSettings,
    } as SettingsManager<SettingsSchema>);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component', () => {
    render(<DebugSettingsPane config={panelConfig} />);
    expect(screen.getByTestId(panelConfig.id)).toBeInTheDocument();
  });

  it('should render default settings component', () => {
    render(<DebugSettingsPane config={panelConfig} />);
    expect(screen.getByText(/default settings/i)).toBeInTheDocument();
  });

  it('should render current settings component', () => {
    render(<DebugSettingsPane config={panelConfig} />);
    expect(screen.getByText(/current settings/i)).toBeInTheDocument();
  });
});
