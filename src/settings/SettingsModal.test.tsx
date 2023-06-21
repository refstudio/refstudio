import { noop } from '../utils/noop';
import { render, screen, userEvent } from '../utils/test-utils';
import { getCachedSetting, initSettings, saveCachedSettings, setCachedSetting } from './settings';
import { SettingsModal } from './SettingsModal';
import { SettingsPaneId } from './types';

vi.mock('./settings');
vi.mock('../events');

describe('SettingsModal component', () => {
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

  test('should render the modal CLOSED (empty)', () => {
    const { container } = render(<SettingsModal open={false} onCloseClick={noop} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('should render 3 settings panels with open={true}', () => {
    render(<SettingsModal open onCloseClick={noop} />);
    expect(screen.getByRole('menuitem', { name: 'General' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Open AI' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Config' })).toBeInTheDocument();
  });

  test.skip('should close Modal on X click', async () => {
    const user = userEvent.setup();
    const spyClose = vi.fn();
    render(<SettingsModal open onCloseClick={spyClose} />);
    await user.click(screen.getByTitle('close'));
    expect(screen.queryByRole('menuitem', { name: 'General' })).not.toBeInTheDocument();
    expect(spyClose).toBeCalled();
  });

  test('should render General panel by default', () => {
    render(<SettingsModal open onCloseClick={noop} />);
    expect(screen.getByTestId('project-general' as SettingsPaneId)).toBeInTheDocument();
  });

  test('should toggle to "Open AI" panel from sidebar', async () => {
    const user = userEvent.setup();
    render(<SettingsModal open onCloseClick={noop} />);
    await user.click(screen.getByText('Open AI'));
    expect(screen.getByTestId('project-openai' as SettingsPaneId)).toBeInTheDocument();
  });
});