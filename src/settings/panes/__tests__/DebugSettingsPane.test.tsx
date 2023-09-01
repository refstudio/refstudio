import { FlatSettingsSchema } from '../../../api/api-types';
import { render, screen } from '../../../test/test-utils';
import { getSettings, initSettings, saveCachedSettings, SettingsManagerView } from '../../settingsManager';
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

const mockSettings: FlatSettingsSchema = {
  current_directory: 'app-dir',
  openai_api_key: '',
  openai_chat_model: 'gpt-3.5-turbo',
  openai_manner: 'concise',
  openai_temperature: 0.7,
  logging_enabled: true,
  logging_filepath: '/tmp',
};

describe('DebugSettingsPane component', () => {
  beforeEach(() => {
    // Fake settings methods
    vi.mocked(initSettings).mockResolvedValue();
    vi.mocked(saveCachedSettings).mockResolvedValue();
    vi.mocked(getSettings).mockResolvedValue({
      default: mockSettings,
    } as SettingsManagerView<FlatSettingsSchema>);
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
