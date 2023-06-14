import { describe, expect, test } from 'vitest';

import { chatWithAI } from './chat';
import { callSidecar } from './sidecar';

vi.mock('./sidecar');

describe('chatWithAI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return list of strings with content returned by sidecar', async () => {
    vi.mocked(callSidecar).mockResolvedValue([
      {
        index: 0,
        text: 'some reply',
      },
    ]);

    const response = await chatWithAI('input text');
    expect(response).toStrictEqual(['some reply']);
  });

  test('should return list of strings with content returned by sidecar', async () => {
    vi.mocked(callSidecar).mockResolvedValue([
      {
        index: 0,
        text: 'some reply',
      },
      {
        index: 1,
        text: 'Another reply',
      },
    ]);

    const response = await chatWithAI('input text');
    expect(response).toStrictEqual(['some reply', 'Another reply']);
  });

  test('should return empty list, and not call sidecar, if provided text is empty', async () => {
    const callSidecarMock = vi.mocked(callSidecar).mockResolvedValue([]);

    const response = await chatWithAI('');
    expect(response).toStrictEqual([]);
    expect(callSidecarMock.mock.calls.length).toBe(0);
  });

  test('should return error message reply if exception thrown calling sidecar', async () => {
    vi.mocked(callSidecar).mockRejectedValue(new Error('Invalid API Key'));

    const response = await chatWithAI('input text');
    expect(response.length).toBe(1);
    expect(response[0]).toMatch(/Invalid API Key/);
  });
});
