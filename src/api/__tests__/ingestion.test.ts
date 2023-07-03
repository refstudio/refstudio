import { getUploadsDir } from '../../io/filesystem';
import { runPDFIngestion } from '../ingestion';
import { callSidecar } from '../sidecar';

vi.mock('../sidecar');
vi.mock('../../io/filesystem');

describe('runPDFIngestion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call sidecar ingest with upload dir arg', async () => {
    const UPLOAD_DIR = '/some/upload/directory';
    vi.mocked(getUploadsDir).mockResolvedValue(UPLOAD_DIR);
    vi.mocked(callSidecar).mockResolvedValue({
      project_name: 'project-name',
      references: [],
    });

    await runPDFIngestion();
    expect(vi.mocked(callSidecar).mock.calls).toHaveLength(1);
    expect(vi.mocked(callSidecar).mock.calls[0]).toStrictEqual(['ingest', ['--pdf_directory', UPLOAD_DIR]]);
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
      },
      {
        fullName: 'Ana Maria',
      },
    ]);
  });
});
