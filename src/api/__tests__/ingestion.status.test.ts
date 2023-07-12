import { getIngestionStatus } from '../ingestion';
import { callSidecar } from '../sidecar';

vi.mock('../sidecar');
vi.mock('../../io/filesystem');

describe('runPDFIngestion', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call sidecar ingest_status', async () => {
    vi.mocked(callSidecar).mockResolvedValue({
      status: 'ok',
      reference_statuses: [
        {
          source_filename: 'file-a.pdf',
          status: 'complete',
        },
        {
          source_filename: 'file-b.pdf',
          status: 'processing',
        },
      ],
    });

    const result = await getIngestionStatus();
    expect(vi.mocked(callSidecar).mock.calls).toHaveLength(1);
    expect(vi.mocked(callSidecar).mock.calls[0]).toStrictEqual(['ingest_status', null]);
    expect(result.status).toBe('ok');
    expect(result.references).toHaveLength(2);
    expect(result.references[0]).toStrictEqual({ filename: 'file-a.pdf', status: 'complete' });
    expect(result.references[1]).toStrictEqual({ filename: 'file-b.pdf', status: 'processing' });
  });
});
