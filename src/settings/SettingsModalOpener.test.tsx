import { act } from '@testing-library/react';

import { listenEvent, RefStudioEventCallback, RefStudioEvents } from '../events';
import { noop } from '../utils/noop';
import { render, screen } from '../utils/test-utils';
import { getCachedSetting, initSettings, saveCachedSettings, setCachedSetting } from './settings';
import { SettingsModalOpener } from './SettingsModalOpener';

vi.mock('./settings');
vi.mock('../events');

describe('SettingsModalOpener component', () => {
  beforeEach(() => {
    // Fake settings methods
    vi.mocked(initSettings).mockResolvedValue();
    vi.mocked(saveCachedSettings).mockResolvedValue();
    vi.mocked(getCachedSetting).mockReturnValue('');
    vi.mocked(setCachedSetting).mockImplementation(noop);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should render the modal CLOSED (empty) by default', () => {
    const { container } = render(<SettingsModalOpener />);
    expect(container).toBeEmptyDOMElement();
  });

  test('should open the Settings model on SETTING menu event', () => {
    let settingEventHandler: undefined | RefStudioEventCallback<string>;
    let eventName = '';
    vi.mocked(listenEvent).mockImplementation(async (event: string, handler: RefStudioEventCallback<string>) => {
      eventName = event;
      settingEventHandler = handler;
      await Promise.resolve();
      return noop();
    });

    render(<SettingsModalOpener />);
    expect(screen.queryByRole('menuitem', { name: 'General' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Open AI' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Config' })).not.toBeInTheDocument();

    expect(eventName).toBe(RefStudioEvents.menu.settings);
    expect(settingEventHandler).toBeDefined();

    // Trigger the settings event to open the modal
    act(() => settingEventHandler!({ event: RefStudioEvents.menu.settings, windowLabel: '', id: 1, payload: '' }));

    expect(screen.getByRole('menuitem', { name: 'General' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Open AI' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Config' })).toBeInTheDocument();
  });

  test('should toggle the Settings model on SETTING menu event', () => {
    let settingEventHandler: undefined | RefStudioEventCallback<string>;
    let eventName = '';
    vi.mocked(listenEvent).mockImplementation(async (event: string, handler: RefStudioEventCallback<string>) => {
      eventName = event;
      settingEventHandler = handler;
      await Promise.resolve();
      return noop();
    });

    render(<SettingsModalOpener />);
    expect(screen.queryByRole('menuitem', { name: 'General' })).not.toBeInTheDocument();
    expect(eventName).toBe(RefStudioEvents.menu.settings);
    expect(settingEventHandler).toBeDefined();

    // Open
    act(() => settingEventHandler!({ event: RefStudioEvents.menu.settings, windowLabel: '', id: 1, payload: '' }));
    expect(screen.getByRole('menuitem', { name: 'General' })).toBeInTheDocument();

    // Close
    act(() => settingEventHandler!({ event: RefStudioEvents.menu.settings, windowLabel: '', id: 1, payload: '' }));
    expect(screen.queryByRole('menuitem', { name: 'General' })).not.toBeInTheDocument();
  });
});
