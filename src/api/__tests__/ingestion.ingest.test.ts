import { universalPost } from '../api';
import { runProjectIngestion } from '../referencesAPI';

vi.mock('../api');
vi.mock('../../io/filesystem');

const PROJECT_ID = 'cafe-babe-1234-5678-1234-5678-1234-5678';

describe('ingestion.ingest', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call backend API to start ingest', async () => {
    vi.mocked(universalPost).mockResolvedValue({
      project_name: 'project-name',
      references: [],
    });

    await runProjectIngestion(PROJECT_ID);
    expect(universalPost).toHaveBeenCalledTimes(1);
    expect(universalPost).toHaveBeenCalledWith(`/api/references/${PROJECT_ID}`, {});
  });

  it('Should map empty IngestResponse[] to empty ReferenceItem[]', async () => {
    vi.mocked(universalPost).mockResolvedValue({
      project_name: 'project-name',
      references: [],
    });

    const response = await runProjectIngestion(PROJECT_ID);
    expect(response).toStrictEqual([]);
  });

  it('Should map undefined IngestResponse to ReferenceItem', async () => {
    vi.mocked(universalPost).mockResolvedValue({
      project_name: 'project-name',
      references: [
        {
          id: '45722618-c4fb-4ae1-9230-7fc19a7219ed',
          source_filename: 'file.pdf',
          status: 'complete',
        },
      ],
    });

    const response = await runProjectIngestion(PROJECT_ID);
    expect(response).toHaveLength(1);
    expect(response[0].id).toBe('45722618-c4fb-4ae1-9230-7fc19a7219ed');
    expect(response[0].filename).toBe('file.pdf');
  });

  it('Should map fullName of authors ReferenceItem', async () => {
    vi.mocked(universalPost).mockResolvedValue({
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

    const response = await runProjectIngestion(PROJECT_ID);
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
