import { act } from '@testing-library/react-hooks';

import { listenEvent, RefStudioEvents } from '../events';
import { noop } from '../utils/noop';
import { render, screen, userEvent } from '../utils/test-utils';
import { flushCachedSettings, getCachedSetting, initSettings, setCachedSetting } from './settings';
import { SettingsModal } from './SettingsModal';
import { SettingsPaneId } from './types';

vi.mock('./settings');
vi.mock('../events');

describe('SettingsModal component', () => {
  beforeEach(() => {
    // Fake settings methods
    vi.mocked(initSettings).mockResolvedValue();
    vi.mocked(flushCachedSettings).mockResolvedValue();
    vi.mocked(getCachedSetting).mockReturnValue('');
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

  test('should render the modal CLOSED (empty)', () => {
    const { container } = render(<SettingsModal />);
    expect(container).toBeEmptyDOMElement();
  });

  test('should render the modal OPEN on SETTING menu event', () => {
    let settingsHandler: undefined | (() => void);
    let eventName = '';
    vi.mocked(listenEvent).mockImplementation(async (event: string, handler: () => void) => {
      eventName = event;
      settingsHandler = handler;
      await Promise.resolve();
      return noop();
    });

    render(<SettingsModal />);

    expect(eventName).toBe(RefStudioEvents.Menu.settings);
    expect(settingsHandler).toBeDefined();

    act(() => {
      settingsHandler!();
    });

    expect(screen.getByRole('menuitem', { name: 'General' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Open AI' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Config' })).toBeInTheDocument();
  });

  test('should render the modal OPEN with defaultOpen=true', () => {
    render(<SettingsModal defaultOpen />);
    expect(screen.getByRole('menuitem', { name: 'General' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Open AI' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Config' })).toBeInTheDocument();
  });

  test.skip('should close Modal on X click', async () => {
    const user = userEvent.setup();
    render(<SettingsModal defaultOpen />);
    expect(screen.getByRole('menuitem', { name: 'General' })).toBeInTheDocument();
    await user.click(screen.getByTitle('close'));
    expect(screen.queryByRole('menuitem', { name: 'General' })).not.toBeInTheDocument();
  });

  test('should render General panel by default', () => {
    render(<SettingsModal defaultOpen />);
    expect(screen.getByTestId('project-general' as SettingsPaneId)).toBeInTheDocument();
  });

  test('should toggle to "Open AI" panel from sidebar', async () => {
    const user = userEvent.setup();
    render(<SettingsModal defaultOpen />);
    await user.click(screen.getByText('Open AI'));
    expect(screen.getByTestId('project-openai' as SettingsPaneId)).toBeInTheDocument();
  });
});
