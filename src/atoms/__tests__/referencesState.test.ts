import { createStore } from 'jotai';

import { getIngestedReferences } from '../../api/ingestion';
import { REFERENCES } from '../../features/references/__tests__/test-fixtures';
import {
  areReferencesLoadedAtom,
  clearAllReferencesAtom,
  getReferencesAtom,
  loadReferencesAtom,
  setReferencesAtom,
} from '../referencesState';

vi.mock('../../api/ingestion');

describe('referencesState', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should clear all references', () => {
    store.set(setReferencesAtom, REFERENCES);
    expect(store.get(getReferencesAtom)).toHaveLength(REFERENCES.length);

    store.set(clearAllReferencesAtom);
    expect(store.get(getReferencesAtom)).toHaveLength(0);
  });

  it('should load ingested references into store', async () => {
    vi.mocked(getIngestedReferences).mockResolvedValue(REFERENCES);
    await store.set(loadReferencesAtom, 'project-id');
    expect(getIngestedReferences).toHaveBeenCalled();
    expect(getIngestedReferences).toHaveBeenCalledWith('project-id');
    expect(store.get(areReferencesLoadedAtom)).toBeTruthy();
    expect(store.get(getReferencesAtom)).toHaveLength(REFERENCES.length);
  });
});
