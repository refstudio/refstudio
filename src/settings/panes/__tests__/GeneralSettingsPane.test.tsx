import { FlatSettingsSchema } from '../../../api/api-types';
import { noop } from '../../../lib/noop';
import { render, screen, userEvent } from '../../../test/test-utils';
import { getCachedSetting, initSettings, saveCachedSettings, setCachedSetting } from '../../settingsManager';
import { PaneConfig } from '../../types';
import { LoggingSettingsPane } from '../LoggingSettingsPane';

vi.mock('../../settingsManager');
vi.mock('../../../events');

const panelConfig: PaneConfig = {
  id: 'project-general',
  Pane: LoggingSettingsPane,
  title: 'OPEN AI',
};

const mockSettings = {
  current_directory: 'APP-DATA-DIR',
  logging_enabled: true,
  logging_filepath: 'PATH',
} satisfies Partial<FlatSettingsSchema>;

describe('GeneralSettingsPane component', () => {
  beforeEach(() => {
    // Fake settings methods
    vi.mocked(initSettings).mockResolvedValue();
    vi.mocked(saveCachedSettings).mockResolvedValue();
    vi.mocked(getCachedSetting).mockImplementation((key) => {
      if (key in mockSettings) {
        return mockSettings[key as keyof typeof mockSettings];
      }
      throw new Error('UNEXPECTED CALL FOR KEY ' + key);
    });
    vi.mocked(setCachedSetting).mockImplementation(noop);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component', () => {
    render(<LoggingSettingsPane config={panelConfig} />);
    expect(screen.getByTestId(panelConfig.id)).toBeInTheDocument();
  });

  it('should render existing settings value', () => {
    const getCachedSettingMock = vi.mocked(getCachedSetting);
    render(<LoggingSettingsPane config={panelConfig} />);

    expect(getCachedSettingMock.mock.calls.length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Active')).toBeChecked();
    expect(screen.getByLabelText('Path')).toHaveValue(mockSettings.logging_filepath);
  });

  it('should save (setCached, flush) with edited values on save', async () => {
    const user = userEvent.setup();
    render(<LoggingSettingsPane config={panelConfig} />);

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();

    // Type
    await user.click(screen.getByLabelText('Active'));
    await user.type(screen.getByLabelText('Path'), '-Updated-2');
    expect(screen.getByLabelText('Active')).not.toBeChecked();
    expect(screen.getByLabelText('Path')).toHaveValue(`${mockSettings.logging_filepath}-Updated-2`);
    expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();

    // Submit
    await user.click(screen.getByRole('button', { name: /save/i }));
    expect(setCachedSetting).toBeCalledTimes(2);
    expect(setCachedSetting).toHaveBeenNthCalledWith(1, 'logging_enabled', false);
    expect(setCachedSetting).toHaveBeenNthCalledWith(2, 'logging_filepath', 'PATH-Updated-2');
    expect(saveCachedSettings).toBeCalledTimes(1);
  });
});
