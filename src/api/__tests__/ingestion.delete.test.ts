import { removeReferences } from '../ingestion';
import { callSidecar } from '../sidecar';
import { DeleteStatusResponse } from '../types';

vi.mock('../sidecar');
vi.mock('../../io/filesystem');

describe('ingestion.delete', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call sidecar delete with --source_filenames', async () => {
    vi.mocked(callSidecar).mockResolvedValue({
      status: 'ok',
    } as DeleteStatusResponse);

    const filenames = ['filea.pdf', 'fileb.pdf'];
    const result = await removeReferences(filenames);
    expect(vi.mocked(callSidecar).mock.calls).toHaveLength(1);
    expect(vi.mocked(callSidecar).mock.calls[0]).toStrictEqual(['delete', { source_filenames: filenames }]);
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
