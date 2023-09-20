import { noop } from '../../lib/noop';
import { act, mockListenEvent, render, screen } from '../../test/test-utils';
import { getCachedSetting, initSettings, saveCachedSettings, setCachedSetting } from '../settingsManager';
import { SettingsModalOpener } from '../SettingsModalOpener';

global.CSS.supports = () => false;

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
    expect(screen.queryByRole('menuitem', { name: 'AI' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Logging' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Config' })).not.toBeInTheDocument();

    expect(mockData.registeredEventNames).toContain('refstudio://menu/settings');

    // Trigger the settings event to open the modal
    act(() => mockData.trigger('refstudio://menu/settings'));

    expect(screen.getByRole('menuitem', { name: 'AI' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Logging' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Config' })).toBeInTheDocument();
  });

  it('should toggle the Settings model on SETTING menu event', () => {
    const mockData = mockListenEvent();

    render(<SettingsModalOpener />);
    expect(screen.queryByRole('menuitem', { name: 'Logging' })).not.toBeInTheDocument();
    expect(mockData.registeredEventNames).toContain('refstudio://menu/settings');

    // Open
    act(() => mockData.trigger('refstudio://menu/settings'));
    expect(screen.getByRole('menuitem', { name: 'Logging' })).toBeInTheDocument();

    // Close
    act(() => mockData.trigger('refstudio://menu/settings'));
    expect(screen.queryByRole('menuitem', { name: 'Logging' })).not.toBeInTheDocument();
  });
});
