import { noop } from '../utils/noop';
import { render, screen, userEvent } from '../utils/test-utils';
import { OpenAiSettingsPane } from './OpenAiSettingsPane';
import { flushCachedSettings, getCachedSetting, initSettings, setCachedSetting, SettingsSchema } from './settings';
import { PaneConfig } from './types';

vi.mock('./settings');
vi.mock('../events');

const panelConfig: PaneConfig = {
  id: 'project-openai',
  Pane: OpenAiSettingsPane,
  title: 'OPEN AI',
};

const mockSettings: SettingsSchema = {
  project: {
    name: 'PROJECT-NAME',
  },
  openAI: {
    apiKey: 'API KEY',
    chatModel: 'CHAT MODEL',
    completeModel: 'COMPLETE MODEL',
  },
  sidecar: {
    logging: {
      active: true,
      path: 'PATH',
    },
  },
};

describe('OpenAiSettingsPane component', () => {
  beforeEach(() => {
    // Fake settings methods
    vi.mocked(initSettings).mockResolvedValue();
    vi.mocked(flushCachedSettings).mockResolvedValue();
    vi.mocked(getCachedSetting).mockImplementation((key) => {
      switch (key) {
        case 'openAI':
        case 'project':
        case 'sidecar':
          return mockSettings[key];
        default:
          throw new Error('UNEXPECTED CALL FOR KEY ' + key);
      }
    });
    vi.mocked(setCachedSetting).mockImplementation(noop);
    //   default: {
    //     project: {
    //       name: 'name',
    //     },
    //     openAI: {
    //       apiKey: 'apiKey',
    //       completeModel: 'completeModel',
    //       chatModel: 'chatModel',
    //     },
    //     sidecar: {
    //       logging: {
    //         active: true,
    //         path: 'path',
    //       },
    //     },
    //   },
    //   settings: {
    //     project: {
    //       name: 'name',
    //     },
    //     openAI: {
    //       apiKey: 'apiKey',
    //       completeModel: 'completeModel',
    //       chatModel: 'chatModel',
    //     },
    //     sidecar: {
    //       logging: {
    //         active: true,
    //         path: 'path',
    //       },
    //     },
    //   },
    //   path: '',
    //   options: {
    //     dir: '',
    //     fileName: '',
    //     numSpaces: 2,
    //     prettify: true,
    //   },
    //   initialize: noopPromise<SettingsSchema>(),
    //   saveSettings: noopPromise(),
    //   hasCache: noop(),
    //   getCache: noop(),
    //   setCache: noop(),

    //   get: noopPromise<unknown>(),
    //   set: noopPromise<unknown>(),
    //   syncCache: noopPromise<unknown>(),
    // });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should render the component', () => {
    render(<OpenAiSettingsPane config={panelConfig} />);
    expect(screen.getByTestId(panelConfig.id)).toBeInTheDocument();
  });

  test('should render existing settings value', () => {
    render(<OpenAiSettingsPane config={panelConfig} />);

    expect(vi.mocked(getCachedSetting).mock.calls.length).toBeGreaterThan(0);
    expect(screen.getByLabelText('API Key')).toHaveValue(mockSettings.openAI.apiKey);
    expect(screen.getByLabelText('Chat Model')).toHaveValue(mockSettings.openAI.chatModel);
    expect(screen.getByLabelText('Complete Model')).toHaveValue(mockSettings.openAI.completeModel);
  });

  test('should save (setCached, flush) with edited values on save', async () => {
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
    expect(vi.mocked(flushCachedSettings).mock.calls.length).toBe(1);
  });
});
