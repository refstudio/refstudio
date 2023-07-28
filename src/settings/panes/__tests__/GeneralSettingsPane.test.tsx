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

const mockSettings: Pick<SettingsSchema, 'general' | 'sidecar'> = {
  general: {
    projectDir: 'APP-DATA-DIR',
  },
  sidecar: {
    logging: {
      active: true,
      path: 'PATH',
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
        case 'general':
          return mockSettings.general;
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
    expect(screen.getByLabelText('Path')).toHaveValue(mockSettings.sidecar.logging.path);
  });

  it('should save (setCached, flush) with edited values on save', async () => {
    const user = userEvent.setup();
    render(<GeneralSettingsPane config={panelConfig} />);

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();

    // Type
    await user.type(screen.getByLabelText('Project Name'), 'dont-care-bc-input-is-disabled');
    await user.click(screen.getByLabelText('Active'));
    await user.type(screen.getByLabelText('Path'), '-Updated-2');
    expect(screen.getByLabelText('Active')).not.toBeChecked();
    expect(screen.getByLabelText('Path')).toHaveValue(`${mockSettings.sidecar.logging.path}-Updated-2`);
    expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();

    // Submit
    await user.click(screen.getByRole('button', { name: /save/i }));
    expect(vi.mocked(setCachedSetting).mock.calls.length).toBe(2);
    expect(vi.mocked(saveCachedSettings).mock.calls.length).toBe(1);
  });
});
