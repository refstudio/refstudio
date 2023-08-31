import { FlatSettingsSchema, RewriteMannerType } from '../../../../api/api-types';
import { noop } from '../../../../lib/noop';
import {
  getCachedSetting,
  getMannerOptions,
  initSettings,
  saveCachedSettings,
  setCachedSetting,
} from '../../../../settings/settingsManager';
import { PaneConfig } from '../../../../settings/types';
import { fireEvent, render, screen, userEvent } from '../../../../test/test-utils';
import { OpenAiSettingsPane } from '../OpenAiSettingsPane';

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
    expect(screen.getByTestId('openai-settings-form')).toHaveFormValues({
      apiKey: mockSettings.openai_api_key,
      chatModel: mockSettings.openai_chat_model,
      manner: mockSettings.openai_manner,
      temperature: String(mockSettings.openai_temperature),
    });
  });

  it('should save (setCached, flush) with edited values on save', async () => {
    const user = userEvent.setup();
    render(<OpenAiSettingsPane config={panelConfig} />);

    expect(screen.getByLabelText('API Key')).toHaveValue('API KEY');
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();

    // Type
    await user.type(screen.getByLabelText('API Key'), '-Updated-1');
    await user.type(screen.getByLabelText('Chat Model'), '-Updated-2');
    await user.selectOptions(screen.getByLabelText('Manner'), 'scholarly' as RewriteMannerType);
    const range = screen.getByLabelText('Creativity (temperature)');
    // https://github.com/testing-library/user-event/issues/871
    // eslint-disable-next-line testing-library/prefer-user-event
    fireEvent.change(range, { target: { value: 0.9 } });

    expect(screen.getByLabelText('API Key')).toHaveValue(`${mockSettings.openai_api_key}-Updated-1`);
    expect(screen.getByLabelText('Chat Model')).toHaveValue(`${mockSettings.openai_chat_model}-Updated-2`);
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
