"""
Author: Shaurya
This script performs a search on Semantic Scholar and retrieves information about a set of papers.
"""
from semanticscholar import SemanticScholar
from .stopwords import stopwords
import sys
import json
import logging

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
    # https://github.com/danielnsilva/semanticscholar/blob/da433a1f45e0c17bbd58300de0602c969602675a/semanticscholar/Paper.py#L93
    def search(
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
    ):
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
            This function doesn't return any value. It writes the search results to stdout.
        """

        # Preprocess the query (e.g., lowercase, remove stopwords)
        query = self.preprocess_query(query)

        # Perform the search using Semantic Scholar's API
        logger.info(f"Preprocessed query: {query}")

        # Perform the search using Semantic Scholar's API
        results = self.s2.search_paper(query, limit=limit, fields=returned_fields)

        logger.info("Executed search using Semantic Scholar's API")

        results_list = []

        # Loop over the search results
        for item in results[:limit]:
            # For each result, create a dictionary with the fields specified in returned_fields
            result = {field: getattr(item, field, None) for field in returned_fields}

            # Replace author dictionaries with author names in each result
            if "authors" in result:
                result["authors"] = [author["name"] for author in result["authors"]]

            results_list.append(result)  # add the result to the list of results

        logger.info(f"First two papers from search results: {results_list[:2]}")

        # Adding a warning log statement
        if not results_list:
            logger.warning("The final results list is empty.")
        return results_list


def search_s2(query, limit=10):
    searcher = Searcher()
    sys.stdout.write(json.dumps(searcher.search(query, limit=limit)))
