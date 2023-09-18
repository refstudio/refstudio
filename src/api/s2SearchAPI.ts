import { S2SearchResult, SearchResponse } from './api-types';
import { apiGetJson, apiPost } from './typed-api';

export async function getS2ReferencesByKeyword(keywords: string, limit = 10): Promise<S2SearchResult[]> {
  const references = await apiGetJson('/api/search/s2', { query: { query: keywords, limit } });
  return parseS2Response(references);
}

export async function postS2Reference(projectId: string, s2SearchResult: S2SearchResult) {
  if (!s2SearchResult.openAccessPdf) {
    return;
  }

  const sourceFileName = new URL(s2SearchResult.openAccessPdf).pathname.split('/').pop() ?? '';

  if (!sourceFileName) {
    return;
  }

  const formatAuthorsFromS2Result = (authorsList: string[]): { full_name: string }[] => {
    const newAuthorList: { full_name: string }[] = [];
    authorsList.forEach((author) => {
      newAuthorList.push({ full_name: author });
    });
    return newAuthorList;
  };

  const status = await apiPost(
    '/api/references/{project_id}',
    { path: { project_id: projectId } },
    {
      type: 'pdf',
      url: s2SearchResult.openAccessPdf,
      metadata: {
        source_filename: sourceFileName,
        citation_key: s2SearchResult.title
          ? s2SearchResult.title
              .replace(/[^a-zA-Z]+/g, '')
              .slice(0, 10)
              .concat(s2SearchResult.year?.toString() ?? '')
          : '',
        doi: '',
        title: s2SearchResult.title,
        abstract: s2SearchResult.abstract,
        contents: '',
        published_date: s2SearchResult.year?.toString(),
        authors: formatAuthorsFromS2Result(s2SearchResult.authors),
      },
    },
  );

  console.log(status);
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
