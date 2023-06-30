import { act } from '@testing-library/react';

import { RefStudioEvents } from '../../events';
import { noop } from '../../lib/noop';
import { mockListenEvent, render, screen } from '../../test/test-utils';
import { getCachedSetting, initSettings, saveCachedSettings, setCachedSetting } from '../settingsManager';
import { SettingsModalOpener } from '../SettingsModalOpener';

vi.mock('../settingsManager');
vi.mock('../../events');

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

  it('should render the modal CLOSED (empty) by default', () => {
    const { container } = render(<SettingsModalOpener />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should open the Settings model on SETTING menu event', () => {
    const mockData = mockListenEvent();

    render(<SettingsModalOpener />);
    expect(screen.queryByRole('menuitem', { name: 'General' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Open AI' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Config' })).not.toBeInTheDocument();

    expect(mockData.registeredEventName).toBe(RefStudioEvents.menu.settings);

    // Trigger the settings event to open the modal
    act(() => mockData.trigger());

    expect(screen.getByRole('menuitem', { name: 'General' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Open AI' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Config' })).toBeInTheDocument();
  });

  it('should toggle the Settings model on SETTING menu event', () => {
    const mockData = mockListenEvent();

    render(<SettingsModalOpener />);
    expect(screen.queryByRole('menuitem', { name: 'General' })).not.toBeInTheDocument();
    expect(mockData.registeredEventName).toBe(RefStudioEvents.menu.settings);

    // Open
    act(() => mockData.trigger());
    expect(screen.getByRole('menuitem', { name: 'General' })).toBeInTheDocument();

    // Close
    act(() => mockData.trigger());
    expect(screen.queryByRole('menuitem', { name: 'General' })).not.toBeInTheDocument();
  });
});
