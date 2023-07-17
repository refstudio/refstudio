import { askForRewrite, DEFAULT_OPTIONS } from '../rewrite';
import { callSidecar } from '../sidecar';
import { RewriteRequest, RewriteResponse } from '../types';

vi.mock('../sidecar');

describe('askForRewrite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call sidecar rewrite with text', async () => {
    const response: RewriteResponse = { status: 'ok', message: '', choices: [] };
    vi.mocked(callSidecar).mockResolvedValue(response);

    const REWRITE_REQUEST_TEXT = 'Some text to rewrite';
    await askForRewrite(REWRITE_REQUEST_TEXT);
    expect(callSidecar).toHaveBeenCalledTimes(1);
    expect(vi.mocked(callSidecar).mock.lastCall![0]).toBe('rewrite');
    expect(vi.mocked(callSidecar).mock.lastCall![1]).toMatchObject({ text: REWRITE_REQUEST_TEXT });
    expect(callSidecar).toHaveBeenCalledWith<[string, RewriteRequest]>('rewrite', {
      text: REWRITE_REQUEST_TEXT,
      n_choices: DEFAULT_OPTIONS.nChoices,
      temperature: DEFAULT_OPTIONS.temperature,
      manner: DEFAULT_OPTIONS.manner,
    });
  });

  it('should call sidecar rewrite with default options', async () => {
    const response: RewriteResponse = { status: 'ok', message: '', choices: [] };
    vi.mocked(callSidecar).mockResolvedValue(response);

    const REWRITE_REQUEST_TEXT = 'Some text to rewrite';
    await askForRewrite(REWRITE_REQUEST_TEXT);
    expect(callSidecar).toHaveBeenCalledTimes(1);
    expect(callSidecar).toHaveBeenCalledWith<[string, RewriteRequest]>('rewrite', {
      text: REWRITE_REQUEST_TEXT,
      n_choices: DEFAULT_OPTIONS.nChoices,
      temperature: DEFAULT_OPTIONS.temperature,
      manner: DEFAULT_OPTIONS.manner,
    });
  });

  it('should call sidecar rewrite with some custom options', async () => {
    const response: RewriteResponse = { status: 'ok', message: '', choices: [] };
    vi.mocked(callSidecar).mockResolvedValue(response);

    const REWRITE_REQUEST_TEXT = 'Some text to rewrite';
    await askForRewrite(REWRITE_REQUEST_TEXT, { manner: 'scholarly' });
    expect(callSidecar).toHaveBeenCalledTimes(1);
    expect(callSidecar).toHaveBeenCalledWith<[string, RewriteRequest]>('rewrite', {
      text: REWRITE_REQUEST_TEXT,
      n_choices: DEFAULT_OPTIONS.nChoices,
      temperature: DEFAULT_OPTIONS.temperature,
      manner: 'scholarly',
    });
  });

  it('should call sidecar rewrite with custom options', async () => {
    const response: RewriteResponse = { status: 'ok', message: '', choices: [] };
    vi.mocked(callSidecar).mockResolvedValue(response);

    const REWRITE_REQUEST_TEXT = 'Some text to rewrite';
    await askForRewrite(REWRITE_REQUEST_TEXT, { temperature: 0.8, manner: 'scholarly', nChoices: 4 });
    expect(callSidecar).toHaveBeenCalledTimes(1);
    expect(callSidecar).toHaveBeenCalledWith<[string, RewriteRequest]>('rewrite', {
      text: REWRITE_REQUEST_TEXT,
      n_choices: 4,
      temperature: 0.8,
      manner: 'scholarly',
    });
  });

  it('Should return rewrite choices', async () => {
    const REWRITE_REPLY_TEXT = 'The rewrite reply!';
    const mockResponse: RewriteResponse = {
      status: 'ok',
      message: '',
      choices: [
        {
          index: 0,
          text: REWRITE_REPLY_TEXT,
        },
        {
          index: 1,
          text: REWRITE_REPLY_TEXT.toUpperCase(),
        },
      ],
    };
    vi.mocked(callSidecar).mockResolvedValue(mockResponse);

    const response = await askForRewrite('some input');
    expect(response).toEqual([REWRITE_REPLY_TEXT, REWRITE_REPLY_TEXT.toUpperCase()]);
  });

  it('Should return error text for internal sidecar exception', async () => {
    vi.mocked(callSidecar).mockRejectedValue('some failure');

    const response = await askForRewrite('some input');
    expect(response.length).toBe(1);
    expect(response[0]).toMatch(/^rewrite error/i);
  });

  it('Should return empty text and not call sidecar for empty selection', async () => {
    const response = await askForRewrite('  ');
    expect(response.length).toBe(1);
    expect(response[0]).toBe('');
    expect(vi.mocked(callSidecar).mock.calls).toHaveLength(0);
  });
});
