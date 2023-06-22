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
    let settingEvtHandler: undefined | RefStudioEventCallback;
    let eventName = '';
    vi.mocked(listenEvent).mockImplementation(async (event: string, handler: RefStudioEventCallback) => {
      eventName = event;
      settingEvtHandler = handler;
      await Promise.resolve();
      return noop();
    });

    render(<SettingsModalOpener />);
    expect(screen.queryByRole('menuitem', { name: 'General' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Open AI' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Config' })).not.toBeInTheDocument();

    expect(eventName).toBe(RefStudioEvents.menu.settings);
    expect(settingEvtHandler).toBeDefined();

    // Trigger the settings event to open the modal
    act(() => settingEvtHandler!({ event: RefStudioEvents.menu.settings, windowLabel: '', id: 1, payload: undefined }));

    expect(screen.getByRole('menuitem', { name: 'General' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Open AI' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Config' })).toBeInTheDocument();
  });

  test('should toggle the Settings model on SETTING menu event', () => {
    let settingEvtHandler: undefined | RefStudioEventCallback;
    let eventName = '';
    vi.mocked(listenEvent).mockImplementation(async (event: string, handler: RefStudioEventCallback) => {
      eventName = event;
      settingEvtHandler = handler;
      await Promise.resolve();
      return noop();
    });

    render(<SettingsModalOpener />);
    expect(screen.queryByRole('menuitem', { name: 'General' })).not.toBeInTheDocument();
    expect(eventName).toBe(RefStudioEvents.menu.settings);
    expect(settingEvtHandler).toBeDefined();

    // Open
    act(() => settingEvtHandler!({ event: RefStudioEvents.menu.settings, windowLabel: '', id: 1, payload: undefined }));
    expect(screen.getByRole('menuitem', { name: 'General' })).toBeInTheDocument();

    // Close
    act(() => settingEvtHandler!({ event: RefStudioEvents.menu.settings, windowLabel: '', id: 1, payload: undefined }));
    expect(screen.queryByRole('menuitem', { name: 'General' })).not.toBeInTheDocument();
  });
});
