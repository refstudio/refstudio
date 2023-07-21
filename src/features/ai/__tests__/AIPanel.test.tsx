import { render, screen, setup } from '../../../test/test-utils';
import { AIPanel } from '../AIPanel';
import { ChatPanelSection } from '../sidebar/ChatPanelSection';
import { SelectionPanelSection } from '../sidebar/SelectionPanelSection';

vi.mock('../sidebar/SelectionPanelSection');
vi.mock('../sidebar/ChatPanelSection');

describe('SelectionPanelSection', () => {
  beforeEach(() => {
    vi.mock('../sidebar/SelectionPanelSection', () => {
      const Fake = vi.fn(() => null);
      return { SelectionPanelSection: Fake };
    });
    vi.mock('../sidebar/ChatPanelSection', () => {
      const Fake = vi.fn(() => null);
      return { ChatPanelSection: Fake };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render selection and chat panels', () => {
    render(<AIPanel />);
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(SelectionPanelSection).toHaveBeenCalled();
    expect(ChatPanelSection).toHaveBeenCalled();
  });

  it('should close selection and chat panels', async () => {
    const fn = vi.fn();
    const { user } = setup(<AIPanel onCloseClick={fn} />);
    await user.click(screen.getByTitle('close'));
    expect(fn).toHaveBeenCalled();
  });
});
