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
  AiSettingsPane,
  API_KEY_TEST_ID,
  MODEL_PROVIDER_TEST_ID,
  MODEL_TEST_ID,
  REWRITE_MANNER_TEST_ID,
  REWRITE_TEMPERATURE_TEST_ID,
} from '../AiSettingsPane';

global.CSS.supports = () => false;

vi.mock('../../../../settings/settingsManager');
vi.mock('../../../../events');

const panelConfig: PaneConfig = {
  id: 'project-ai',
  Pane: AiSettingsPane,
  title: 'AI',
};

const mockSettings = {
  model_provider: 'openai',
  model: 'MODEL',
  api_key: 'API KEY',
  rewrite_manner: 'elaborate',
  temperature: 0.8,
} satisfies Partial<FlatSettingsSchema>;

describe('AiSettingsPane component', () => {
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
    render(<AiSettingsPane config={panelConfig} />);
    expect(screen.getByTestId(panelConfig.id)).toBeInTheDocument();
  });

  it('should render existing settings value', () => {
    render(<AiSettingsPane config={panelConfig} />);

    expect(getCachedSetting).toHaveBeenCalled();
    expect(within(screen.getByTestId(API_KEY_TEST_ID)).getByRole('input')).toHaveValue(mockSettings.api_key);
    expect(within(screen.getByTestId(MODEL_TEST_ID)).getByRole('input')).toHaveValue(mockSettings.model);
    expect(within(screen.getByTestId(REWRITE_MANNER_TEST_ID)).getByRole('select')).toHaveValue(
      mockSettings.rewrite_manner,
    );
    expect(within(screen.getByTestId(REWRITE_TEMPERATURE_TEST_ID)).getByRole('slider')).toHaveValue(
      `${mockSettings.temperature}`,
    );
  });

  it('should save (setCached, flush) with edited values on save', async () => {
    const user = userEvent.setup();
    render(<AiSettingsPane config={panelConfig} />);

    expect(within(screen.getByTestId(API_KEY_TEST_ID)).getByRole('input')).toHaveValue('API KEY');
    expect(screen.getByRole('button', { name: /save/i })).toHaveAttribute('aria-disabled', 'true');

    // Type
    await user.selectOptions(within(screen.getByTestId(MODEL_PROVIDER_TEST_ID)).getByRole('select'), 'ollama');
    await user.type(screen.getByTestId(MODEL_TEST_ID), '-Updated-2');
    await user.type(screen.getByTestId(API_KEY_TEST_ID), '-Updated-1');
    await user.selectOptions(within(screen.getByTestId(REWRITE_MANNER_TEST_ID)).getByRole('select'), 'scholarly');
    const range = within(screen.getByTestId(REWRITE_TEMPERATURE_TEST_ID)).getByRole('slider');
    // https://github.com/testing-library/user-event/issues/871
    // eslint-disable-next-line testing-library/prefer-user-event
    fireEvent.change(range, { target: { value: 0.9 } });

    expect(within(screen.getByTestId(MODEL_TEST_ID)).getByRole('input')).toHaveValue(`llama2-Updated-2`);
    expect(within(screen.getByTestId(API_KEY_TEST_ID)).getByRole('input')).toHaveValue(
      `${mockSettings.api_key}-Updated-1`,
    );
    expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();

    // Submit
    await user.click(screen.getByRole('button', { name: /save/i }));
    expect(vi.mocked(setCachedSetting)).toHaveBeenCalledTimes(5);
    expect(vi.mocked(setCachedSetting)).toHaveBeenNthCalledWith(1, 'model_provider', 'ollama');
    expect(vi.mocked(setCachedSetting)).toHaveBeenNthCalledWith(2, 'model', 'llama2-Updated-2');
    expect(vi.mocked(setCachedSetting)).toHaveBeenNthCalledWith(3, 'api_key', 'API KEY-Updated-1');
    expect(vi.mocked(setCachedSetting)).toHaveBeenNthCalledWith(4, 'rewrite_manner', 'scholarly');
    expect(vi.mocked(setCachedSetting)).toHaveBeenNthCalledWith(5, 'temperature', 0.9);
    expect(vi.mocked(saveCachedSettings)).toHaveBeenCalledTimes(1);
  });
});
