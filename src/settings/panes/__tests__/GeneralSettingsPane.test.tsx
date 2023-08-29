import { noop } from '../../../lib/noop';
import { render, screen, userEvent } from '../../../test/test-utils';
import {
  getCachedSetting,
  initSettings,
  saveCachedSettings,
  setCachedSetting,
  SettingsSchema,
} from '../../settingsManager';
import { PaneConfig } from '../../types';
import { GeneralSettingsPane } from '../GeneralSettingsPane';

vi.mock('../../settingsManager');
vi.mock('../../../events');

const panelConfig: PaneConfig = {
  id: 'project-general',
  Pane: GeneralSettingsPane,
  title: 'OPEN AI',
};

const mockSettings: Pick<SettingsSchema, 'project' | 'sidecar'> = {
  project: {
    current_directory: 'APP-DATA-DIR',
  },
  sidecar: {
    logging: {
      enable: true,
      filepath: 'PATH',
    },
  },
};

describe('GeneralSettingsPane component', () => {
  beforeEach(() => {
    // Fake settings methods
    vi.mocked(initSettings).mockResolvedValue();
    vi.mocked(saveCachedSettings).mockResolvedValue();
    vi.mocked(getCachedSetting).mockImplementation((key) => {
      switch (key) {
        case 'project':
          return mockSettings.project;
        case 'sidecar.logging':
          return mockSettings.sidecar.logging;
        default:
          throw new Error('UNEXPECTED CALL FOR KEY ' + key);
      }
    });
    vi.mocked(setCachedSetting).mockImplementation(noop);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component', () => {
    render(<GeneralSettingsPane config={panelConfig} />);
    expect(screen.getByTestId(panelConfig.id)).toBeInTheDocument();
  });

  it('should render existing settings value', () => {
    const getCachedSettingMock = vi.mocked(getCachedSetting);
    render(<GeneralSettingsPane config={panelConfig} />);

    expect(getCachedSettingMock.mock.calls.length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Active')).toBeChecked();
    expect(screen.getByLabelText('Path')).toHaveValue(mockSettings.sidecar.logging.filepath);
  });

  it('should save (setCached, flush) with edited values on save', async () => {
    const user = userEvent.setup();
    render(<GeneralSettingsPane config={panelConfig} />);

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();

    // Type
    await user.click(screen.getByLabelText('Active'));
    await user.type(screen.getByLabelText('Path'), '-Updated-2');
    expect(screen.getByLabelText('Active')).not.toBeChecked();
    expect(screen.getByLabelText('Path')).toHaveValue(`${mockSettings.sidecar.logging.filepath}-Updated-2`);
    expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();

    // Submit
    await user.click(screen.getByRole('button', { name: /save/i }));
    expect(setCachedSetting).toBeCalledTimes(1);
    expect(saveCachedSettings).toBeCalledTimes(1);
  });
});
