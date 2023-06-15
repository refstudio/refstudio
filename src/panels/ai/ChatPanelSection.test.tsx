import { screen, waitFor } from '@testing-library/react';

import { chatWithAI } from '../../api/chat';
import { render, userEvent } from '../../utils/test-utils';
import { ChatPanelSection } from './ChatPanelSection';

vi.mock('../../api/chat');

describe('ChatPanelSection component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should render the panel without history content and a textbox', () => {
    render(<ChatPanelSection />);
    expect(screen.getByText(/your chat history will be shown here\./i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('should call api if textbox has text', async () => {
    const chatWithAiMock = vi.mocked(chatWithAI).mockResolvedValue([]);
    const user = userEvent.setup();
    render(<ChatPanelSection />);
    await user.type(screen.getByRole('textbox'), 'This is a question.');
    await user.click(screen.getByTitle('Send'));
    expect(chatWithAiMock.mock.calls.length).toBe(1);
  });

  test('should NOT call api if textbox has empty text', async () => {
    const chatWithAiMock = vi.mocked(chatWithAI).mockResolvedValue([]);
    const user = userEvent.setup();
    render(<ChatPanelSection />);
    await user.click(screen.getByTitle('Send'));
    expect(chatWithAiMock.mock.calls.length).toBe(0);
  });

  // https://testing-library.com/docs/user-event/keyboard/
  test('should call api on ENTER in the textbox', async () => {
    const chatWithAiMock = vi.mocked(chatWithAI).mockResolvedValue([]);
    const user = userEvent.setup();
    render(<ChatPanelSection />);
    await user.type(screen.getByRole('textbox'), 'This is a question.');
    await user.type(screen.getByRole('textbox'), '{enter}');
    expect(chatWithAiMock.mock.calls.length).toBe(1);
  });

  test('should NOT call api on SHIFT+ENTER in the textbox', async () => {
    const chatWithAiMock = vi.mocked(chatWithAI).mockResolvedValue([]);
    const user = userEvent.setup();
    render(<ChatPanelSection />);
    await user.type(screen.getByRole('textbox'), 'This is a question.');
    await user.type(screen.getByRole('textbox'), '{Shift>}{enter}');
    expect(chatWithAiMock.mock.calls.length).toBe(0);
  });

  test('should render question and reply in the screen', async () => {
    const chatWithAiMock = vi.mocked(chatWithAI).mockResolvedValue(['Sure!']);
    const user = userEvent.setup();
    render(<ChatPanelSection />);
    await user.type(screen.getByRole('textbox'), 'Will this test pass?');
    await user.click(screen.getByTitle('Send'));
    expect(chatWithAiMock.mock.calls.length).toBe(1);
    expect(screen.getByText('Will this test pass?')).toBeInTheDocument();
    expect(screen.getByText('Sure!')).toBeInTheDocument();
  });

  test('should render ... while waiting for reply', async () => {
    // Note: this is a promise that _don't resolve_ so that we can test the "..." below.
    vi.mocked(chatWithAI).mockImplementation(async () => new Promise<string[]>(() => ['---']));
    const user = userEvent.setup();
    render(<ChatPanelSection />);

    await user.type(screen.getByRole('textbox'), 'Will this test pass?');
    await user.click(screen.getByTitle('Send'));

    expect(screen.getByText('Will this test pass?')).toBeInTheDocument();
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  test('should render ... and then the ### reply text', async () => {
    let resolveFn: () => void = vi.fn();
    vi.mocked(chatWithAI).mockImplementation(async () => {
      await new Promise<void>((resolve) => {
        // Capture resolve function to call after assertion
        resolveFn = resolve;
      });
      return ['###'];
    });
    const user = userEvent.setup();
    render(<ChatPanelSection />);

    await user.type(screen.getByRole('textbox'), 'Will this test pass?');
    await user.click(screen.getByTitle('Send'));

    expect(screen.getByText('Will this test pass?')).toBeInTheDocument();
    expect(screen.getByText('...')).toBeInTheDocument();

    resolveFn();

    await waitFor(() => {
      expect(screen.getByText('###')).toBeInTheDocument();
    });
  });
});
