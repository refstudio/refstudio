import { getSystemPath, getUploadsDir } from '../../io/filesystem';
import { getIngestedReferences, runPDFIngestion } from '../ingestion';
import { callSidecar } from '../sidecar';

vi.mock('../sidecar');
vi.mock('../../io/filesystem');

describe('ingestion.ingest', () => {
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
          id: '45722618-c4fb-4ae1-9230-7fc19a7219ed',
          source_filename: 'file.pdf',
          status: 'complete',
        },
      ],
    });

    const response = await runPDFIngestion();
    expect(response).toHaveLength(1);
    expect(response[0].id).toBe('45722618-c4fb-4ae1-9230-7fc19a7219ed');
    expect(response[0].filename).toBe('file.pdf');
  });

  it('Should map fullName of authors ReferenceItem', async () => {
    vi.mocked(callSidecar).mockResolvedValue({
      project_name: 'project-name',
      references: [
        {
          id: '45722618-c4fb-4ae1-9230-7fc19a7219ed',
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
});
