import { atom } from 'jotai';

import { S2SearchResult } from '../api/api-types';
import { getS2ReferencesByKeyword } from '../api/s2SearchAPI';

// #####################################################################################
// Internal Atoms
// #####################################################################################
const searchResultsAtom = atom<S2SearchResult[]>([]);

// #####################################################################################
// References API
// #####################################################################################

export const getSearchResultsAtom = atom((get) => Object.values(get(searchResultsAtom)));

export const loadSearchResultsAtom = atom(null, async (_get, set, keywords: string) => {
  const searchResults = await getS2ReferencesByKeyword(keywords);
  set(searchResultsAtom, searchResults);
});
