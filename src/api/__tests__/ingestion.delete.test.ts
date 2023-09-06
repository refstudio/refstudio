import { universalPost } from '../api';
import { DeleteStatusResponse } from '../api-types';
import { removeReferences } from '../referencesAPI';

vi.mock('../api');
vi.mock('../../io/filesystem');

describe('ingestion.delete', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call backend API delete with --reference_ids', async () => {
    vi.mocked(universalPost).mockResolvedValue({
      status: 'ok',
    } as DeleteStatusResponse);

    const referenceIds = ['45722618-c4fb-4ae1-9230-7fc19a7219ed', '45722618-c4fb-4ae1-9230-7fc19a7219ed'];
    const result = await removeReferences(referenceIds, 'project-id');
    expect(universalPost).toHaveBeenCalledTimes(1);
    expect(universalPost).toHaveBeenCalledWith('/api/references/project-id/bulk_delete', {
      reference_ids: referenceIds,
    });
    expect(result).toBeUndefined();
  });

  it('should throw exception if call to backend API delete returns status error', async () => {
    vi.mocked(universalPost).mockResolvedValue({
      status: 'error',
      message: 'error message',
    } as DeleteStatusResponse);

    await expect(removeReferences([], 'project-id')).rejects.toThrow();
  });
});
