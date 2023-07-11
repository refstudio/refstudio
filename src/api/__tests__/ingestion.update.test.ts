import { REFERENCES } from '../../features/references/__tests__/test-fixtures';
import { updateReference } from '../ingestion';
import { callSidecar } from '../sidecar';
import { ReferenceUpdate, UpdateStatusResponse } from '../types';

vi.mock('../sidecar');
vi.mock('../../io/filesystem');

describe('ingestion.update', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call sidecar update with patch for (citationKey, title, publishedDate and authors)', async () => {
    const [ref1] = REFERENCES;
    vi.mocked(callSidecar).mockResolvedValue({
      status: 'ok',
      message: '',
    } as UpdateStatusResponse);

    await updateReference(ref1.filename, {
      citationKey: ref1.citationKey + 'xx',
      title: ref1.title + ' NEW',
      publishedDate: '2023-07-01',
      authors: [{ fullName: 'Joe Doe Dundee', lastName: 'Dundee' }],
    });
    expect(vi.mocked(callSidecar).mock.calls).toHaveLength(1);
    expect(vi.mocked(callSidecar).mock.calls[0]).toStrictEqual<[string, ReferenceUpdate]>([
      'update',
      {
        source_filename: ref1.filename,
        patch: {
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
        },
      },
    ]);
  });

  it('should not call sidecar if update patch is empty', async () => {
    const [ref1] = REFERENCES;
    vi.mocked(callSidecar).mockResolvedValue({
      status: 'ok',
      message: '',
    } as UpdateStatusResponse);

    await updateReference(ref1.filename, {});
    expect(vi.mocked(callSidecar).mock.calls).toHaveLength(0);
  });

  it('should throw error if status is error from sidecar call', async () => {
    const [ref1] = REFERENCES;
    vi.mocked(callSidecar).mockResolvedValue({
      status: 'error',
      message: 'what!',
    } as UpdateStatusResponse);

    await expect(updateReference(ref1.filename, { title: ref1.title + ' updated' })).rejects.toThrow();
  });
});
