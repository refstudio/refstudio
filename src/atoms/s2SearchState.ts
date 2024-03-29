import { atom } from 'jotai';

import { S2SearchResult } from '../api/api-types';
import { removeProjectReferences } from '../api/referencesAPI';
import { getS2ReferencesByKeyword, postS2Reference } from '../api/s2SearchAPI';
import { refreshFileTreeAtom } from './fileExplorerActions';
import { loadReferencesAtom } from './referencesState';

// #####################################################################################
// Internal Atoms
// #####################################################################################
export const searchResultsAtom = atom<S2SearchResult[]>([]);

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
  await set(refreshFileTreeAtom);
  return status;
});

export const removeS2ReferenceAtom = atom(null, async (_get, set, projectId: string, refId: string) => {
  const status = await removeProjectReferences(projectId, [refId]);
  await set(loadReferencesAtom, projectId);
  return status;
});
