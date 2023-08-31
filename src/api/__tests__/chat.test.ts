import { universalPost } from '../api';
import { chatWithAI } from '../chat';

vi.mock('../api');

describe('chatWithAI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return list of strings with content returned by backend API', async () => {
    vi.mocked(universalPost).mockResolvedValue({
      status: 'ok',
      message: '',
      choices: [
        {
          index: 0,
          text: 'some reply',
        },
      ],
    });

    const response = await chatWithAI('', 'input text');
    expect(response).toStrictEqual(['some reply']);
  });

  it('should return list of strings with content returned by backend API 2', async () => {
    vi.mocked(universalPost).mockResolvedValue({
      status: 'ok',
      message: '',
      choices: [
        {
          index: 0,
          text: 'some reply',
        },
        {
          index: 1,
          text: 'Another reply',
        },
      ],
    });

    const response = await chatWithAI('', 'input text');
    expect(response).toStrictEqual(['some reply', 'Another reply']);
  });

  it('should return empty list, and not call backend API, if provided text is empty', async () => {
    const response = await chatWithAI('', '');
    expect(response).toStrictEqual([]);
    expect(universalPost).not.toHaveBeenCalled();
  });

  it('should return error message reply if exception thrown calling backend API', async () => {
    vi.mocked(universalPost).mockRejectedValue(new Error('Invalid API Key'));

    const response = await chatWithAI('', 'input text');
    expect(response.length).toBe(1);
    expect(response[0]).toMatch(/Invalid API Key/);
  });
});
