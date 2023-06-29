import { noop } from '../../../lib/noop';
import {
  getCachedSetting,
  initSettings,
  saveCachedSettings,
  setCachedSetting,
  SettingsSchema,
} from '../../../settings/settingsManager';
import { PaneConfig } from '../../../settings/types';
import { render, screen, userEvent } from '../../../test/test-utils';
import { OpenAiSettingsPane } from './OpenAiSettingsPane';

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
    completeModel: 'COMPLETE MODEL',
  },
};

describe('OpenAiSettingsPane component', () => {
  beforeEach(() => {
    // Fake settings methods
    vi.mocked(initSettings).mockResolvedValue();
    vi.mocked(saveCachedSettings).mockResolvedValue();
    vi.mocked(getCachedSetting).mockReturnValue(mockSettings.openAI);
    vi.mocked(setCachedSetting).mockImplementation(noop);
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

    expect(vi.mocked(getCachedSetting).mock.calls.length).toBeGreaterThan(0);
    expect(screen.getByLabelText('API Key')).toHaveValue(mockSettings.openAI.apiKey);
    expect(screen.getByLabelText('Chat Model')).toHaveValue(mockSettings.openAI.chatModel);
    expect(screen.getByLabelText('Complete Model')).toHaveValue(mockSettings.openAI.completeModel);
  });

  it('should save (setCached, flush) with edited values on save', async () => {
    const user = userEvent.setup();
    render(<OpenAiSettingsPane config={panelConfig} />);

    expect(screen.getByLabelText('API Key')).toHaveValue('API KEY');
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();

    // Type
    await user.type(screen.getByLabelText('API Key'), '-Updated-1');
    await user.type(screen.getByLabelText('Chat Model'), '-Updated-2');
    await user.type(screen.getByLabelText('Complete Model'), '-Updated-3');
    expect(screen.getByLabelText('API Key')).toHaveValue(`${mockSettings.openAI.apiKey}-Updated-1`);
    expect(screen.getByLabelText('Chat Model')).toHaveValue(`${mockSettings.openAI.chatModel}-Updated-2`);
    expect(screen.getByLabelText('Complete Model')).toHaveValue(`${mockSettings.openAI.completeModel}-Updated-3`);
    expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();

    // Submit
    await user.click(screen.getByRole('button', { name: /save/i }));
    expect(vi.mocked(setCachedSetting).mock.calls.length).toBe(1);
    expect(vi.mocked(setCachedSetting).mock.calls[0]).toStrictEqual([
      'openAI',
      {
        apiKey: `${mockSettings.openAI.apiKey}-Updated-1`,
        chatModel: `${mockSettings.openAI.chatModel}-Updated-2`,
        completeModel: `${mockSettings.openAI.completeModel}-Updated-3`,
      },
    ]);
    expect(vi.mocked(saveCachedSettings).mock.calls.length).toBe(1);
  });
});
