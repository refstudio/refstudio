"""
Author: Shaurya
This script performs a search on Semantic Scholar and 
retrieves information about a set of papers.
"""
import logging

from semanticscholar import SemanticScholar
from sidecar.search.constants import stopwords
from sidecar.search.schemas import S2SearchResult, SearchRequest, SearchResponse
from sidecar.typing import ResponseStatus

logger = logging.getLogger(__name__)


class Searcher:
    # Initialize the SemanticScholar API client and stopwords set
    def __init__(self):
        self.s2 = SemanticScholar()
        self.stopwords = stopwords

    # Method to preprocess the query
    def preprocess_query(self, query):
        # convert query to lowercase and remove stopwords
        query = query.lower()
        query = "+".join([word for word in query.split() if word not in self.stopwords])
        return query

    # Method to perform the search
    # Other search fields can be found here:
    # https://github.com/danielnsilva/semanticscholar/blob/da433a1f45e0c17bbd58300de0602c969602675a/semanticscholar/Paper.py#L93 # noqa: E501
    def search_func(
        self,
        query,
        limit=10,
        returned_fields=[
            "title",
            "abstract",
            "venue",
            "year",
            "paperId",
            "citationCount",
            "openAccessPdf",
            "authors",
        ],
    ) -> SearchResponse:
        """
        This function performs a search on Semantic Scholar's API and
        writes the results in JSON to stdout.

        Parameters
        ----------
        query : str
            The search term to query the Semantic Scholar's API.
        limit : int
            The maximum number of results to return. Default is 10.
        returned_fields : list of str
            The fields that should be included in the returned results.
            Default includes 'title', 'abstract', 'venue', 'year',
            'paperId', 'citationCount', 'openAccessPdf', 'authors'.

        Returns
        -------
        SearchResponse
        """

        # Preprocess the query (e.g., lowercase, remove stopwords)
        query = self.preprocess_query(query)

        # Perform the search using Semantic Scholar's API
        logger.info(f"Preprocessed query: {query}")

        # Perform the search using Semantic Scholar's API
        try:
            results = self.s2.search_paper(query, limit=limit, fields=returned_fields)
        except Exception as e:
            logger.warning(f"Error while searching using Semantic Scholar's API: {e}")
            return SearchResponse(
                status=ResponseStatus.ERROR, message=str(e), results=[]
            )

        logger.info("Executed search using Semantic Scholar's API")

        results_list = []

        for item in results[:limit]:
            openaccesspdf = getattr(item, "openAccessPdf", None)
            result = S2SearchResult(
                title=getattr(item, "title", None),
                abstract=getattr(item, "abstract", None),
                venue=getattr(item, "venue", None),
                year=getattr(item, "year", None),
                paperId=getattr(item, "paperId", None),
                citationCount=getattr(item, "citationCount", None),
                openAccessPdf=openaccesspdf.get("url") if openaccesspdf else None,
                authors=[author["name"] for author in getattr(item, "authors", [])],
            )
            results_list.append(result)

        logger.info(f"First two papers from search results: {results_list[:2]}")
        return SearchResponse(
            status=ResponseStatus.OK, message="", results=results_list
        )


def search_s2(query: str, limit: int = 10) -> SearchResponse:
    searcher = Searcher()
    response = searcher.search_func(query, limit=limit)
    return response
