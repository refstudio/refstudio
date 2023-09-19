import {
  IngestMetadataRequest,
  IngestUploadsRequest,
  ReferenceCreate,
  S2SearchResult,
  SearchResponse,
} from './api-types';
import { apiGetJson, apiPost } from './typed-api';

export async function getS2ReferencesByKeyword(keywords: string, limit = 10): Promise<S2SearchResult[]> {
  const references = await apiGetJson('/api/search/s2', { query: { query: keywords, limit } });
  return parseS2Response(references);
}

export async function postS2Reference(projectId: string, s2SearchResult: S2SearchResult) {
  const formatAuthorsFromS2Result = (authorsList: string[]): { full_name: string }[] => {
    const newAuthorList: { full_name: string }[] = [];
    authorsList.forEach((author) => {
      newAuthorList.push({ full_name: author });
    });
    return newAuthorList;
  };

  const getBestPublicationDate = (reference: S2SearchResult) => {
    if (reference.publicationDate) {
      const date = new Date(reference.publicationDate);
      return (
        date.getFullYear().toString() +
        '-' +
        ('0' + date.getMonth().toString()).slice(-2) +
        '-' +
        date.getDate().toString()
      );
    } else {
      return reference.year?.toString();
    }
  };

  const metadata: ReferenceCreate = {
    source_filename: '',
    citation_key: '',
    doi: '',
    title: s2SearchResult.title ?? '',
    abstract: s2SearchResult.abstract,
    contents: '',
    published_date: getBestPublicationDate(s2SearchResult),
    authors: formatAuthorsFromS2Result(s2SearchResult.authors),
  };

  const genericRequestBody: IngestUploadsRequest = {
    type: 'metadata',
    metadata,
  };

  const pdfRequestBody: IngestMetadataRequest = {
    type: 'metadata',
    url: s2SearchResult.openAccessPdf,
    metadata,
  };

  const status = await apiPost(
    '/api/references/{project_id}',
    { path: { project_id: projectId } },
    s2SearchResult.openAccessPdf ? pdfRequestBody : genericRequestBody,
  );

  return status;
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
    publicationDate: reference.publicationDate ?? '',
    paperId: reference.paperId ?? '',
    citationCount: reference.citationCount ?? 0,
    openAccessPdf: reference.openAccessPdf ?? '',
    authors: reference.authors,
  }));
}
