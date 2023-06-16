import { act } from '@testing-library/react-hooks';

import { listenEvent, RefStudioEvents } from '../events';
import { noop } from '../utils/noop';
import { render, screen } from '../utils/test-utils';
import { flushCachedSettings, getCachedSetting, initSettings, setCachedSetting } from './settings';
import { SettingsModal } from './SettingsModal';

vi.mock('./settings');
vi.mock('../events');

describe('SettingsModal component', () => {
  beforeEach(() => {
    // Fake settings methods
    vi.mocked(initSettings).mockResolvedValue();
    vi.mocked(flushCachedSettings).mockResolvedValue();
    vi.mocked(getCachedSetting).mockReturnValue('');
    vi.mocked(setCachedSetting).mockImplementation(noop);
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

    expect(screen.getByText(/project name/i)).toBeInTheDocument();
  });

  test('should render the modal OPEN with defaultOpen=true', () => {
    render(<SettingsModal defaultOpen />);
    expect(screen.getByText(/project name/i)).toBeInTheDocument();
  });
});
