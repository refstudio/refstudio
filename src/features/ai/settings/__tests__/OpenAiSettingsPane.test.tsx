import { noop } from '../../../../lib/noop';
import {
  getCachedSetting,
  getMannerOptions,
  initSettings,
  OpenAiManner,
  saveCachedSettings,
  setCachedSetting,
  SettingsSchema,
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

const mockSettings: Pick<SettingsSchema, 'openAI'> = {
  openAI: {
    apiKey: 'API KEY',
    chatModel: 'CHAT MODEL',
    manner: 'elaborate',
    temperature: 0.8,
  },
};

describe('OpenAiSettingsPane component', () => {
  beforeEach(() => {
    // Fake settings methods
    vi.mocked(initSettings).mockResolvedValue();
    vi.mocked(saveCachedSettings).mockResolvedValue();
    vi.mocked(getCachedSetting).mockReturnValue(mockSettings.openAI);
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
      apiKey: mockSettings.openAI.apiKey,
      chatModel: mockSettings.openAI.chatModel,
      manner: mockSettings.openAI.manner,
      temperature: String(mockSettings.openAI.temperature),
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
    await user.selectOptions(screen.getByLabelText('Manner'), 'scholarly' as OpenAiManner);
    const range = screen.getByLabelText('Creativity (temperature)');
    // https://github.com/testing-library/user-event/issues/871
    // eslint-disable-next-line testing-library/prefer-user-event
    fireEvent.change(range, { target: { value: 0.9 } });

    expect(screen.getByLabelText('API Key')).toHaveValue(`${mockSettings.openAI.apiKey}-Updated-1`);
    expect(screen.getByLabelText('Chat Model')).toHaveValue(`${mockSettings.openAI.chatModel}-Updated-2`);
    expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();

    // Submit
    await user.click(screen.getByRole('button', { name: /save/i }));
    expect(vi.mocked(setCachedSetting).mock.calls.length).toBe(1);
    expect(vi.mocked(setCachedSetting).mock.calls[0]).toStrictEqual([
      'openAI',
      {
        apiKey: `${mockSettings.openAI.apiKey}-Updated-1`,
        chatModel: `${mockSettings.openAI.chatModel}-Updated-2`,
        manner: 'scholarly',
        temperature: 0.9,
      },
    ]);
    expect(vi.mocked(saveCachedSettings).mock.calls.length).toBe(1);
  });
});
