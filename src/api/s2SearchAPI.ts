import { S2SearchResult, SearchResponse } from './api-types';
import { apiGetJson } from './typed-api';

export async function getS2ReferencesByKeyword(keywords: string): Promise<S2SearchResult[]> {
  const references = await apiGetJson('/api/search/s2', { query: { query: keywords, limit: 10 } });
  return parseS2Response(references);
}

// #####################################################################################
// Utility functions
// #####################################################################################
function parseS2Response(references: SearchResponse): S2SearchResult[] {
  return references.results.map((reference) => ({
    title: reference.title ?? '',
    year: reference.year ?? undefined,
    abstract: reference.abstract ?? '',
    venue: reference.venue ?? '',
    paperId: reference.paperId ?? '',
    citationCount: reference.citationCount ?? 0,
    openAccessPdf: reference.openAccessPdf ?? '',
    authors: reference.authors ?? [],
  }));
}
