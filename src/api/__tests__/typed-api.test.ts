import { universalGet, universalPost } from '../api';
import { apiGetJson, apiPost } from '../typed-api';

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

  it('should issue POST requests with query parameters', async () => {
    vi.mocked(universalPost).mockResolvedValueOnce({
      abc: { project_name: 'ABC', project_path: '/path/to/project' },
    });
    const response = await apiPost(
      '/api/projects/',
      {
        query: {
          project_name: 'abc',
        },
      },
      // TODO: update request body type for this endpoint
      {} as unknown as never,
    );
    expect(response).toEqual({
      abc: { project_name: 'ABC', project_path: '/path/to/project' },
    });
    expect(universalPost).toHaveBeenCalledWith('/api/projects/?project_name=abc', {});
  });
});
