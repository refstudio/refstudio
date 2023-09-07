import { createStore } from 'jotai';

import { updateProjectReference } from '../../api/referencesAPI';
import { REFERENCES } from '../../features/references/__tests__/test-fixtures';
import { ReferenceItem } from '../../types/ReferenceItem';
import { getDerivedReferenceAtom, setReferencesAtom, updateReferenceAtom } from '../referencesState';

vi.mock('../../api/referencesAPI');
const PROJECT_ID = 'cafe-babe-1234-5678-1234-5678-1234-5678';

describe('referencesState.update', () => {
  let store: ReturnType<typeof createStore>;
  const [ref1] = REFERENCES;

  beforeEach(() => {
    store = createStore();
    store.set(setReferencesAtom, REFERENCES);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call referencesAPI with patched title (and no other field)', async () => {
    const newTitle = 'Updated title';
    await store.set(updateReferenceAtom, PROJECT_ID, ref1.id, { ...ref1, title: newTitle });

    expect(updateProjectReference).toHaveBeenCalledTimes(1);
    expect(updateProjectReference).toHaveBeenCalledWith(PROJECT_ID, ref1.id, { title: newTitle });
  });

  it('should save updated fields back to store reference', async () => {
    const originalTitle = ref1.title;
    const newTitle = 'Updated title';
    await store.set(updateReferenceAtom, PROJECT_ID, ref1.id, { ...ref1, title: 'Updated title' });

    const updated = store.get(getDerivedReferenceAtom(ref1.id));
    expect(updated?.title).not.toBe(originalTitle);
    expect(updated?.title).toBe(newTitle);
  });

  it('should not update references not found in the store', async () => {
    await store.set(updateReferenceAtom, PROJECT_ID, 'UNKNOWN ID', { ...ref1, title: 'some' });
    expect(updateProjectReference).not.toHaveBeenCalled();
  });

  it('should not send fields that are updated to same value', async () => {
    await store.set(updateReferenceAtom, PROJECT_ID, ref1.id, { ...ref1, title: String(ref1.title) });
    expect(updateProjectReference).toHaveBeenCalledTimes(0);
  });

  it('should not patch fields not tracked by updateReference', async () => {
    await store.set(updateReferenceAtom, PROJECT_ID, ref1.id, { ...ref1, abstract: 'new abstract' });
    expect(updateProjectReference).toHaveBeenCalledTimes(0);

    const updated = store.get(getDerivedReferenceAtom(ref1.id));
    expect(updated?.abstract).not.toBe('new abstract');
  });

  it('should patch "citationKey", "title", "publishedDate" and "authors"', async () => {
    await store.set(updateReferenceAtom, PROJECT_ID, ref1.id, {
      ...ref1,
      citationKey: ref1.citationKey + 'z',
      title: ref1.title + ' updated',
      publishedDate: '2023-07-11',
      authors: [{ fullName: 'Author Name', lastName: 'Name' }, ...ref1.authors],
    });
    expect(updateProjectReference).toHaveBeenCalledTimes(1);
    expect(updateProjectReference).toHaveBeenCalledWith<[string, string, Partial<ReferenceItem>]>(PROJECT_ID, ref1.id, {
      authors: [
        {
          fullName: 'Author Name',
          lastName: 'Name',
        },
        ...ref1.authors,
      ],
      citationKey: ref1.citationKey + 'z',
      publishedDate: '2023-07-11',
      title: ref1.title + ' updated',
    });

    const updated = store.get(getDerivedReferenceAtom(ref1.id));
    expect(updated?.abstract).not.toBe('new abstract');
  });
});
