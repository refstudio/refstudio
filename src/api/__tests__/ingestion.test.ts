import { getSystemPath, getUploadsDir } from '../../io/filesystem';
import { getIngestedReferences, getIngestionStatus, removeReferences, runPDFIngestion } from '../ingestion';
import { callSidecar } from '../sidecar';
import { DeleteStatusResponse } from '../types';

vi.mock('../sidecar');
vi.mock('../../io/filesystem');

describe('runPDFIngestion', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call sidecar ingest with upload dir arg', async () => {
    vi.mocked(callSidecar).mockResolvedValue({
      project_name: 'project-name',
      references: [],
    });

    await runPDFIngestion();
    expect(vi.mocked(callSidecar).mock.calls).toHaveLength(1);
    const uploadsDir = await getSystemPath(getUploadsDir());
    expect(vi.mocked(callSidecar).mock.calls[0]).toStrictEqual(['ingest', { pdf_directory: uploadsDir }]);
  });

  it('should call sidecar ingest_references with upload dir arg', async () => {
    vi.mocked(callSidecar).mockResolvedValue({
      project_name: 'project-name',
      references: [],
    });

    const result = await getIngestedReferences();
    expect(vi.mocked(callSidecar).mock.calls).toHaveLength(1);
    const uploadsDir = await getSystemPath(getUploadsDir());
    expect(vi.mocked(callSidecar).mock.calls[0]).toStrictEqual(['ingest_references', { pdf_directory: uploadsDir }]);
    expect(result).toStrictEqual([]);
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

  it('Should map empty IngestResponse[] to empty ReferenceItem[]', async () => {
    vi.mocked(callSidecar).mockResolvedValue({
      project_name: 'project-name',
      references: [],
    });

    const response = await runPDFIngestion();
    expect(response).toStrictEqual([]);
  });

  it('Should map undefined IngestResponse to ReferenceItem', async () => {
    vi.mocked(callSidecar).mockResolvedValue({
      project_name: 'project-name',
      references: [
        {
          source_filename: 'file.pdf',
          status: 'complete',
        },
      ],
    });

    const response = await runPDFIngestion();
    expect(response).toHaveLength(1);
    expect(response[0].id).toBe('file.pdf');
    expect(response[0].filename).toBe('file.pdf');
  });

  it('Should map fullName of authors ReferenceItem', async () => {
    vi.mocked(callSidecar).mockResolvedValue({
      project_name: 'project-name',
      references: [
        {
          source_filename: 'file.pdf',
          status: 'complete',
          authors: [
            {
              full_name: 'Joe Doe',
              email: 'joe@doe.com',
              given_name: 'Joe',
              surname: 'Doe',
            },
            {
              full_name: 'Ana Maria',
            },
          ],
        },
      ],
    });

    const response = await runPDFIngestion();
    expect(response).toHaveLength(1);
    expect(response[0].authors).toStrictEqual([
      {
        fullName: 'Joe Doe',
        lastName: 'Doe',
      },
      {
        fullName: 'Ana Maria',
        lastName: 'Maria',
      },
    ]);
  });
});
