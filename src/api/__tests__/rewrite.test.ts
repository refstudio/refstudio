import { notifyErr, notifyError } from '../../notifications/notifications';
import { universalPost } from '../api';
import { askForRewrite, AskForRewriteReturn } from '../rewrite';
import { DEFAULT_OPTIONS } from '../rewrite.config';
import { RewriteRequest, RewriteResponse } from '../types';

vi.mock('../api');
vi.mock('../../notifications/notifications');

describe('askForRewrite', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call rewrite API with text', async () => {
    const response: RewriteResponse = { status: 'ok', message: '', choices: [] };
    vi.mocked(universalPost).mockResolvedValue(response);

    const REWRITE_REQUEST_TEXT = 'Some text to rewrite';
    await askForRewrite(REWRITE_REQUEST_TEXT);
    expect(universalPost).toHaveBeenCalledTimes(1);
  });

  it('should call rewrite API with default options', async () => {
    const response: RewriteResponse = { status: 'ok', message: '', choices: [] };
    vi.mocked(universalPost).mockResolvedValue(response);

    const REWRITE_REQUEST_TEXT = 'Some text to rewrite';
    await askForRewrite(REWRITE_REQUEST_TEXT);
    expect(universalPost).toHaveBeenCalledTimes(1);
    expect(universalPost).toHaveBeenCalledWith<[string, RewriteRequest]>('api/ai/rewrite', {
      text: REWRITE_REQUEST_TEXT,
      n_choices: DEFAULT_OPTIONS.nChoices,
      temperature: DEFAULT_OPTIONS.temperature,
      manner: DEFAULT_OPTIONS.manner,
    });
  });

  it('should call rewrite API with some custom options', async () => {
    const response: RewriteResponse = { status: 'ok', message: '', choices: [] };
    vi.mocked(universalPost).mockResolvedValue(response);

    const REWRITE_REQUEST_TEXT = 'Some text to rewrite';
    await askForRewrite(REWRITE_REQUEST_TEXT, { manner: 'scholarly' });
    expect(universalPost).toHaveBeenCalledTimes(1);
    expect(universalPost).toHaveBeenCalledWith<[string, RewriteRequest]>('api/ai/rewrite', {
      text: REWRITE_REQUEST_TEXT,
      n_choices: DEFAULT_OPTIONS.nChoices,
      temperature: DEFAULT_OPTIONS.temperature,
      manner: 'scholarly',
    });
  });

  it('should call rewrite API with custom options', async () => {
    const response: RewriteResponse = { status: 'ok', message: '', choices: [] };
    vi.mocked(universalPost).mockResolvedValue(response);

    const REWRITE_REQUEST_TEXT = 'Some text to rewrite';
    await askForRewrite(REWRITE_REQUEST_TEXT, { temperature: 0.8, manner: 'scholarly', nChoices: 4 });
    expect(universalPost).toHaveBeenCalledTimes(1);
    expect(universalPost).toHaveBeenCalledWith<[string, RewriteRequest]>('api/ai/rewrite', {
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
    vi.mocked(universalPost).mockResolvedValue(mockResponse);

    const response = await askForRewrite('some input');
    expect(response).toEqual<AskForRewriteReturn>({
      ok: true,
      choices: [REWRITE_REPLY_TEXT, REWRITE_REPLY_TEXT.toUpperCase()],
    });
  });

  it('Should return error text for error status', async () => {
    const mockResponse: RewriteResponse = { status: 'error', message: 'Error message', choices: [] };
    vi.mocked(universalPost).mockResolvedValue(mockResponse);

    const response = await askForRewrite('some input');
    expect(response).toEqual<AskForRewriteReturn>({
      ok: false,
      message: 'Cannot rewrite selection. Please check the notification tray for more details.',
    });

    expect(notifyError).toHaveBeenCalledTimes(1);
  });

  it('Should return error text for internal rewrite api exception', async () => {
    vi.mocked(universalPost).mockRejectedValue('some failure');

    const response = await askForRewrite('some input');
    expect(response).toEqual<AskForRewriteReturn>({
      ok: false,
      message: 'Cannot rewrite selection. Please check the notification tray for more details.',
    });

    expect(notifyErr).toHaveBeenCalledTimes(1);
  });

  it('Should return empty text and not call rewrite api for empty selection', async () => {
    const response = await askForRewrite('  ');
    expect(response).toEqual<AskForRewriteReturn>({
      ok: false,
      message: 'You should provide a selection with text.',
    });

    expect(universalPost).not.toHaveBeenCalled();
  });
});
