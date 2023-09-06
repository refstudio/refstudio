import { REFERENCES } from '../../features/references/__tests__/test-fixtures';
import { universalPatch } from '../api';
import { UpdateStatusResponse } from '../api-types';
import { updateReference } from '../referencesAPI';

vi.mock('../api');
vi.mock('../../io/filesystem');

const PROJECT_ID = 'cafe-babe-1234-5678-1234-5678-1234-5678';

describe('ingestion.update', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call backend API update with patch for (citationKey, title, publishedDate and authors)', async () => {
    const [ref1] = REFERENCES;
    vi.mocked(universalPatch).mockResolvedValue({
      status: 'ok',
      message: '',
    } as UpdateStatusResponse);

    await updateReference(PROJECT_ID, ref1.id, {
      citationKey: ref1.citationKey + 'xx',
      title: ref1.title + ' NEW',
      publishedDate: '2023-07-01',
      authors: [{ fullName: 'Joe Doe Dundee', lastName: 'Dundee' }],
    });
    expect(universalPatch).toHaveBeenCalledTimes(1);
    expect(universalPatch).toHaveBeenCalledWith(`/api/references/${PROJECT_ID}/${ref1.id}`, {
      data: {
        citation_key: 'doe2023xx',
        title: ref1.title + ' NEW',
        published_date: '2023-07-01',
        authors: [
          {
            full_name: 'Joe Doe Dundee',
            surname: 'Dundee',
          },
        ],
      },
    });
  });

  it('should not call backend API if update patch is empty', async () => {
    const [ref1] = REFERENCES;
    vi.mocked(universalPatch).mockResolvedValue({
      status: 'ok',
      message: '',
    } as UpdateStatusResponse);

    await updateReference(PROJECT_ID, ref1.id, {});
    expect(vi.mocked(universalPatch).mock.calls).toHaveLength(0);
  });

  it('should throw error if status is error from backend API call', async () => {
    const [ref1] = REFERENCES;
    vi.mocked(universalPatch).mockResolvedValue({
      status: 'error',
      message: 'what!',
    } as UpdateStatusResponse);

    await expect(updateReference(PROJECT_ID, ref1.id, { title: ref1.title + ' updated' })).rejects.toThrow();
  });
});
