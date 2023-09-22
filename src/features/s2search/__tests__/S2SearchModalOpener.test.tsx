import { act, mockListenEvent, render, screen } from '../../../test/test-utils';
import { S2SearchModalOpener } from '../S2SearchModalOpener';

global.CSS.supports = () => false;

vi.mock('../../../events');

describe('SettingsModalOpener component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the modal CLOSED (empty) by default', () => {
    const { container } = render(<S2SearchModalOpener />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should open the S2 Search model on references/search  menu event', () => {
    const mockData = mockListenEvent();

    render(<S2SearchModalOpener />);
    expect(screen.queryByPlaceholderText('Search Semantic Scholar...')).not.toBeInTheDocument();

    expect(mockData.registeredEventNames).toContain('refstudio://menu/references/search');

    // Trigger the settings event to open the modal
    act(() => mockData.trigger('refstudio://menu/references/search'));

    expect(screen.getByPlaceholderText('Search Semantic Scholar...')).toBeInTheDocument();
  });

  it('should toggle the Settings model on SETTING menu event', () => {
    const mockData = mockListenEvent();

    render(<S2SearchModalOpener />);
    expect(screen.queryByPlaceholderText('Search Semantic Scholar...')).not.toBeInTheDocument();
    expect(mockData.registeredEventNames).toContain('refstudio://menu/references/search');

    // Open
    act(() => mockData.trigger('refstudio://menu/references/search'));
    expect(screen.getByPlaceholderText('Search Semantic Scholar...')).toBeInTheDocument();

    // Close
    act(() => mockData.trigger('refstudio://menu/references/search'));
    expect(screen.queryByPlaceholderText('Search Semantic Scholar...')).not.toBeInTheDocument();
  });
});
