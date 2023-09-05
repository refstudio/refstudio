import { FlatSettingsSchema } from '../../../../api/api-types';
import { noop } from '../../../../lib/noop';
import {
  getCachedSetting,
  getMannerOptions,
  initSettings,
  saveCachedSettings,
  setCachedSetting,
} from '../../../../settings/settingsManager';
import { PaneConfig } from '../../../../settings/types';
import { fireEvent, render, screen, userEvent, within } from '../../../../test/test-utils';
import {
  API_KEY_TEST_ID,
  CHAT_MODEL_TEST_ID,
  OpenAiSettingsPane,
  REWRITE_MANNER_TEST_ID,
  REWRITE_TEMPERATURE_TEST_ID,
} from '../OpenAiSettingsPane';

vi.mock('../../../../settings/settingsManager');
vi.mock('../../../../events');

const panelConfig: PaneConfig = {
  id: 'project-openai',
  Pane: OpenAiSettingsPane,
  title: 'OPEN AI',
};

const mockSettings = {
  openai_api_key: 'API KEY',
  openai_chat_model: 'CHAT MODEL',
  openai_manner: 'elaborate',
  openai_temperature: 0.8,
} satisfies Partial<FlatSettingsSchema>;

describe('OpenAiSettingsPane component', () => {
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
    vi.mocked(getMannerOptions).mockReturnValue(['concise', 'elaborate', 'scholarly']);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component', () => {
    render(<OpenAiSettingsPane config={panelConfig} />);
    expect(screen.getByTestId(panelConfig.id)).toBeInTheDocument();
  });

  it('should render existing settings value', () => {
    render(<OpenAiSettingsPane config={panelConfig} />);

    expect(getCachedSetting).toHaveBeenCalled();
    expect(within(screen.getByTestId(API_KEY_TEST_ID)).getByRole('input')).toHaveValue(mockSettings.openai_api_key);
    expect(within(screen.getByTestId(CHAT_MODEL_TEST_ID)).getByRole('input')).toHaveValue(
      mockSettings.openai_chat_model,
    );
    expect(within(screen.getByTestId(REWRITE_MANNER_TEST_ID)).getByRole('select')).toHaveValue(
      mockSettings.openai_manner,
    );
    expect(within(screen.getByTestId(REWRITE_TEMPERATURE_TEST_ID)).getByRole('slider')).toHaveValue(
      `${mockSettings.openai_temperature}`,
    );
  });

  it('should save (setCached, flush) with edited values on save', async () => {
    const user = userEvent.setup();
    render(<OpenAiSettingsPane config={panelConfig} />);

    expect(within(screen.getByTestId(API_KEY_TEST_ID)).getByRole('input')).toHaveValue('API KEY');
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();

    // Type
    await user.type(screen.getByTestId(API_KEY_TEST_ID), '-Updated-1');
    await user.type(screen.getByTestId(CHAT_MODEL_TEST_ID), '-Updated-2');
    await user.selectOptions(within(screen.getByTestId(REWRITE_MANNER_TEST_ID)).getByRole('select'), 'scholarly');
    const range = within(screen.getByTestId(REWRITE_TEMPERATURE_TEST_ID)).getByRole('slider');
    // https://github.com/testing-library/user-event/issues/871
    // eslint-disable-next-line testing-library/prefer-user-event
    fireEvent.change(range, { target: { value: 0.9 } });

    expect(within(screen.getByTestId(API_KEY_TEST_ID)).getByRole('input')).toHaveValue(
      `${mockSettings.openai_api_key}-Updated-1`,
    );
    expect(within(screen.getByTestId(CHAT_MODEL_TEST_ID)).getByRole('input')).toHaveValue(
      `${mockSettings.openai_chat_model}-Updated-2`,
    );
    expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();

    // Submit
    await user.click(screen.getByRole('button', { name: /save/i }));
    expect(vi.mocked(setCachedSetting)).toHaveBeenCalledTimes(4);
    expect(vi.mocked(setCachedSetting)).toHaveBeenNthCalledWith(1, 'openai_api_key', 'API KEY-Updated-1');
    expect(vi.mocked(setCachedSetting)).toHaveBeenNthCalledWith(2, 'openai_chat_model', 'CHAT MODEL-Updated-2');
    expect(vi.mocked(setCachedSetting)).toHaveBeenNthCalledWith(3, 'openai_manner', 'scholarly');
    expect(vi.mocked(setCachedSetting)).toHaveBeenNthCalledWith(4, 'openai_temperature', 0.9);
    expect(vi.mocked(saveCachedSettings)).toHaveBeenCalledTimes(1);
  });
});
