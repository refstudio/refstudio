import { removeReferences } from '../ingestion';
import { callSidecar } from '../sidecar';
import { DeleteStatusResponse } from '../types';

vi.mock('../sidecar');
vi.mock('../../io/filesystem');

describe('ingestion.delete', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call sidecar delete with --reference_ids', async () => {
    vi.mocked(callSidecar).mockResolvedValue({
      status: 'ok',
    } as DeleteStatusResponse);

    const referenceIds = ['45722618-c4fb-4ae1-9230-7fc19a7219ed', '45722618-c4fb-4ae1-9230-7fc19a7219ed'];
    const result = await removeReferences(referenceIds);
    expect(vi.mocked(callSidecar).mock.calls).toHaveLength(1);
    expect(vi.mocked(callSidecar).mock.calls[0]).toStrictEqual(['delete', { reference_ids: referenceIds }]);
    expect(result).toBeUndefined();
  });

  it('should throw exception if call to sidecar delete returns status error', async () => {
    vi.mocked(callSidecar).mockResolvedValue({
      status: 'error',
      message: 'error message',
    } as DeleteStatusResponse);

    await expect(removeReferences([])).rejects.toThrow();
  });
});
