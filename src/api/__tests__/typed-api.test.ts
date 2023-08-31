import { universalGet } from '../api';
import { apiGetJson } from '../typed-api';

vi.mock('../api');

describe('Typed API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should issue GET requests with path parameters', async () => {
    vi.mocked(universalGet).mockResolvedValueOnce(JSON.stringify('text file'));
    const response = await apiGetJson('/api/fs/{project_id}/{filepath}', {
      path: { project_id: 'abc', filepath: 'foo/bar.txt' },
    });
    expect(response).toBe('"text file"');
    expect(universalGet).toHaveBeenCalledWith('/api/fs/abc/foo/bar.txt', undefined);
  });
});
