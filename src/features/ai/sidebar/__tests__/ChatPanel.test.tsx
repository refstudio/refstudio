import { createStore } from 'jotai';

import { chatInteraction } from '../../../../api/chat';
import { act, screen, setupWithJotaiProvider, userEvent, waitFor } from '../../../../test/test-utils';
import { ChatbotPanel } from '../ChatPanel';

vi.mock('../../../../api/chat');

describe('ChatPanel component', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the panel without history content and a textbox', () => {
    setupWithJotaiProvider(<ChatbotPanel />, store);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should call api if textbox has text', async () => {
    const chatWithAiMock = vi.mocked(chatInteraction).mockResolvedValue('');
    const user = userEvent.setup();
    setupWithJotaiProvider(<ChatbotPanel />, store);
    await user.type(screen.getByRole('textbox'), 'This is a question.');
    await act(async () => {
      await user.click(screen.getByTitle('Send'));
    });
    expect(chatWithAiMock).toBeCalled();
  });

  it('should NOT call api if textbox has empty text', async () => {
    const chatWithAiMock = vi.mocked(chatInteraction).mockResolvedValue('');
    const user = userEvent.setup();
    setupWithJotaiProvider(<ChatbotPanel />, store);
    await act(async () => {
      await user.click(screen.getByTitle('Send'));
    });
    expect(chatWithAiMock).not.toHaveBeenCalled();
  });

  // https://testing-library.com/docs/user-event/keyboard/
  it('should call api on ENTER in the textbox', async () => {
    const chatWithAiMock = vi.mocked(chatInteraction).mockResolvedValue('');
    const user = userEvent.setup();
    setupWithJotaiProvider(<ChatbotPanel />, store);
    await act(async () => {
      await user.type(screen.getByRole('textbox'), 'This is a question.');
      await user.type(screen.getByRole('textbox'), '{enter}');
    });
    expect(chatWithAiMock).toHaveBeenCalledTimes(1);
  });

  // https://testing-library.com/docs/user-event/keyboard/
  it('should display ERROR if chatWithAI throw exception', async () => {
    const chatWithAiMock = vi.mocked(chatInteraction).mockRejectedValue('Error message.');
    const user = userEvent.setup();
    setupWithJotaiProvider(<ChatbotPanel />, store);
    await act(async () => {
      await user.type(screen.getByRole('textbox'), 'This is a question.');
      await user.type(screen.getByRole('textbox'), '{enter}');
    });
    expect(chatWithAiMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText('ERROR: Error message.')).toBeInTheDocument();
  });

  it('should NOT call api on SHIFT+ENTER in the textbox', async () => {
    const chatWithAiMock = vi.mocked(chatInteraction).mockResolvedValue('');
    const user = userEvent.setup();
    setupWithJotaiProvider(<ChatbotPanel />, store);
    await user.type(screen.getByRole('textbox'), 'This is a question.');
    await user.type(screen.getByRole('textbox'), '{Shift>}{enter}');
    expect(chatWithAiMock).toHaveBeenCalledTimes(0);
  });

  it('should render question and reply in the screen', async () => {
    const chatWithAiMock = vi.mocked(chatInteraction).mockResolvedValue('Sure!');
    const user = userEvent.setup();
    setupWithJotaiProvider(<ChatbotPanel />, store);
    await user.type(screen.getByRole('textbox'), 'Will this test pass?');
    await act(async () => {
      await user.click(screen.getByTitle('Send'));
    });
    expect(chatWithAiMock.mock.calls.length).toBe(1);
    expect(screen.getByText('Will this test pass?')).toBeInTheDocument();
    expect(screen.getByText('Sure!')).toBeInTheDocument();
  });

  it('should render the thinking animation while waiting for reply', async () => {
    // Note: this is a promise that _don't resolve_ so that we can test the "..." below.
    vi.mocked(chatInteraction).mockImplementation(async () => new Promise<string>(() => '---'));
    const user = userEvent.setup();
    setupWithJotaiProvider(<ChatbotPanel />, store);

    await user.type(screen.getByRole('textbox'), 'Will this test pass?');
    await act(async () => {
      await user.click(screen.getByTitle('Send'));
    });

    expect(screen.getByText('Will this test pass?')).toBeInTheDocument();
    expect(screen.getByTestId('chatLoadingAnimation')).toBeInTheDocument();
  });

  it('should render the thinking animation and then the ### reply text', async () => {
    let onMessageChunk: (part: string, full: string) => void = () => fail();
    let resolveFn: (text: string) => void = () => fail();
    vi.mocked(chatInteraction).mockImplementation(async (_, __, onMessage) => {
      onMessageChunk = onMessage;
      await new Promise<string>((resolve) => {
        // Capture resolstrig function to call after assertion
        resolveFn = resolve;
      });
      return 'Full Text';
    });
    const user = userEvent.setup();
    setupWithJotaiProvider(<ChatbotPanel />, store);

    await user.type(screen.getByRole('textbox'), 'Will this test pass?');
    await act(async () => {
      await user.click(screen.getByTitle('Send'));
    });

    expect(screen.getByText('Will this test pass?')).toBeInTheDocument();
    expect(screen.getByTestId('chatLoadingAnimation')).toBeInTheDocument();

    act(() => onMessageChunk('Some', 'Some'));

    await waitFor(() => {
      expect(screen.getByText('Some')).toBeInTheDocument();
    });

    act(() => onMessageChunk(' reply text.', 'Some reply text.'));

    await waitFor(() => {
      expect(screen.getByText('Some reply text.')).toBeInTheDocument();
    });

    act(() => resolveFn('Some reply text.'));
    await waitFor(() => {
      expect(screen.getByText('Some reply text.')).toBeInTheDocument();
    });
  });
});
