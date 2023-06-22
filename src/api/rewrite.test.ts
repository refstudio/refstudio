import { describe, expect, test } from 'vitest';

import { askForRewrite } from './rewrite';
import { callSidecar } from './sidecar';
import { RewriteChoice } from './types';

vi.mock('./sidecar');
vi.mock('../filesystem');

describe('askForRewrite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should call sidecar rewrite with text', async () => {
    vi.mocked(callSidecar).mockResolvedValue([] as RewriteChoice[]);

    const REWRITE_REQUEST_TEXT = 'Some text to rewrite';
    await askForRewrite(REWRITE_REQUEST_TEXT);
    expect(vi.mocked(callSidecar).mock.calls).toHaveLength(1);
    expect(vi.mocked(callSidecar).mock.calls[0]).toStrictEqual(['rewrite', ['--text', REWRITE_REQUEST_TEXT]]);
  });

  test('Should return text from first RewriteChoice', async () => {
    const REWRITE_REPLY_TEXT = 'The rewrite reply!';
    vi.mocked(callSidecar).mockResolvedValue([
      {
        index: 0,
        text: REWRITE_REPLY_TEXT,
      },
    ] as RewriteChoice[]);

    const response = await askForRewrite('some input');
    expect(response).toBe(REWRITE_REPLY_TEXT);
  });

  test('Should return error text for internal sidecar exception', async () => {
    vi.mocked(callSidecar).mockRejectedValue('some failure');

    const response = await askForRewrite('some input');
    expect(response).toMatch(/^rewrite error/i);
  });

  test('Should return empty text and not call sidecar for empty selection', async () => {
    const response = await askForRewrite('  ');
    expect(response).toBe('');
    expect(vi.mocked(callSidecar).mock.calls).toHaveLength(0);
  });
});
