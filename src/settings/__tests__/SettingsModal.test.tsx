import { noop } from '../../lib/noop';
import { render, screen, userEvent } from '../../test/test-utils';
import {
  getCachedSetting,
  getMannerOptions,
  initSettings,
  saveCachedSettings,
  setCachedSetting,
} from '../settingsManager';
import { SettingsModal } from '../SettingsModal';

global.CSS.supports = () => false;

vi.mock('../settingsManager');
vi.mock('../../events');

describe('SettingsModal component', () => {
  beforeEach(() => {
    // Fake settings methods
    vi.mocked(initSettings).mockResolvedValue();
    vi.mocked(saveCachedSettings).mockResolvedValue();
    vi.mocked(getCachedSetting).mockReturnValue('');
    vi.mocked(setCachedSetting).mockImplementation(noop);
    vi.mocked(getMannerOptions).mockReturnValue(['concise', 'elaborate', 'scholarly']);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the modal CLOSED (empty)', () => {
    const { container } = render(<SettingsModal open={false} onClose={noop} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render 3 settings panels with open={true}', () => {
    render(<SettingsModal open onClose={noop} />);
    expect(screen.getByRole('menuitem', { name: 'AI' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Logging' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Config' })).toBeInTheDocument();
  });

  it.skip('should close Modal on X click', async () => {
    const user = userEvent.setup();
    const spyClose = vi.fn();
    render(<SettingsModal open onClose={spyClose} />);
    await user.click(screen.getByTitle('close'));
    expect(screen.queryByRole('menuitem', { name: 'Logging' })).not.toBeInTheDocument();
    expect(spyClose).toBeCalled();
  });

  it('should render "AI" panel by default', () => {
    render(<SettingsModal open onClose={noop} />);
    expect(screen.getByTestId('project-ai')).toBeInTheDocument();
  });

  it('should toggle to "Logging" panel from sidebar', async () => {
    const user = userEvent.setup();
    render(<SettingsModal open onClose={noop} />);
    await user.click(screen.getByText('Logging'));
    expect(screen.getByTestId('project-logging')).toBeInTheDocument();
  });
});
