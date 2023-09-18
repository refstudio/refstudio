import { atom } from 'jotai';

import { S2SearchResult } from '../api/api-types';
import { getS2ReferencesByKeyword, postS2Reference } from '../api/s2SearchAPI';
import { loadReferencesAtom } from './referencesState';

// #####################################################################################
// Internal Atoms
// #####################################################################################
const searchResultsAtom = atom<S2SearchResult[]>([]);

// #####################################################################################
// References API
// #####################################################################################

export const getSearchResultsAtom = atom((get) => Object.values(get(searchResultsAtom)));

export const loadSearchResultsAtom = atom(null, async (_get, set, keywords: string, limit?: number) => {
  const searchResults = await getS2ReferencesByKeyword(keywords, limit);
  set(searchResultsAtom, searchResults);
});

export const clearSearchResultsAtom = atom(null, (_get, set) => {
  set(searchResultsAtom, []);
});

export const addS2ReferenceAtom = atom(null, async (_get, set, projectId: string, s2SearchResult: S2SearchResult) => {
  const status = await postS2Reference(projectId, s2SearchResult);
  await set(loadReferencesAtom, projectId);
  return status;
});
