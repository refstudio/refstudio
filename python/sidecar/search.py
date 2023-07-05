"""
Author: Shaurya
This script performs a search on Semantic Scholar and retrieves information about a set of papers.

Instructions:
The script takes two command line arguments:
--query: The term you want to search on Semantic Scholar, written in quotation marks (e.g., "brain computer interface").
--limit: Optional, the maximum number of papers to retrieve. Default is 10.

Run the script like so from your terminal:
    python search.py --query "computational linguistics" --limit 10
"""
import argparse
from semanticscholar import SemanticScholar


class Search:
    # Initialize the SemanticScholar API client and stopwords set
    def __init__(self):
        self.s2 = SemanticScholar()
        self.stopwords = set(
            [
                "i",
                "me",
                "my",
                "myself",
                "we",
                "our",
                "ours",
                "ourselves",
                "you",
                "you're",
                "you've",
                "you'll",
                "you'd",
                "your",
                "yours",
                "yourself",
                "yourselves",
                "he",
                "him",
                "his",
                "himself",
                "she",
                "she's",
                "her",
                "hers",
                "herself",
                "it",
                "it's",
                "its",
                "itself",
                "they",
                "them",
                "their",
                "theirs",
                "themselves",
                "what",
                "which",
                "who",
                "whom",
                "this",
                "that",
                "that'll",
                "these",
                "those",
                "am",
                "is",
                "are",
                "was",
                "were",
                "be",
                "been",
                "being",
                "have",
                "has",
                "had",
                "having",
                "do",
                "does",
                "did",
                "doing",
                "a",
                "an",
                "the",
                "and",
                "but",
                "if",
                "or",
                "because",
                "as",
                "until",
                "while",
                "of",
                "at",
                "by",
                "for",
                "with",
                "about",
                "against",
                "between",
                "into",
                "through",
                "during",
                "before",
                "after",
                "above",
                "below",
                "to",
                "from",
                "up",
                "down",
                "in",
                "out",
                "on",
                "off",
                "over",
                "under",
                "again",
                "further",
                "then",
                "once",
                "here",
                "there",
                "when",
                "where",
                "why",
                "how",
                "all",
                "any",
                "both",
                "each",
                "few",
                "more",
                "most",
                "other",
                "some",
                "such",
                "no",
                "nor",
                "not",
                "only",
                "own",
                "same",
                "so",
                "than",
                "too",
                "very",
                "s",
                "t",
                "can",
                "will",
                "just",
                "don",
                "don't",
                "should",
                "should've",
                "now",
                "d",
                "ll",
                "m",
                "o",
                "re",
                "ve",
                "y",
                "ain",
                "aren",
                "aren't",
                "couldn",
                "couldn't",
                "didn",
                "didn't",
                "doesn",
                "doesn't",
                "hadn",
                "hadn't",
                "hasn",
                "hasn't",
                "haven",
                "haven't",
                "isn",
                "isn't",
                "ma",
                "mightn",
                "mightn't",
                "mustn",
                "mustn't",
                "needn",
                "needn't",
                "shan",
                "shan't",
                "shouldn",
                "shouldn't",
                "wasn",
                "wasn't",
                "weren",
                "weren't",
                "won",
                "won't",
                "wouldn",
                "wouldn't",
            ]
        )

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
        search_fields=[
            "title",
            "abstract",
            "venue",
            "year",
            "corpusId",
            "citationCount",
            "openAccessPdf",
        ],
    ):
        # Preprocess the query
        query = self.preprocess_query(query)
        results = self.s2.search_paper(query, limit=limit, fields=search_fields)
        results_list = []
        # For each result, create a dictionary with desired fields
        for item in results[:limit]:
            result = {field: getattr(item, field, None) for field in search_fields}
            results_list.append(result)
        return results_list


# Main function to parse arguments and perform the search
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Semantic Scholar search")
    parser.add_argument(
        "--query",
        type=str,
        required=True,
        help="Search query for the Semantic Scholar search",
    )
    parser.add_argument(
        "--limit", type=int, default=10, help="Limit for the number of search results"
    )
    args = parser.parse_args()

    ss = Search()
    results = ss.search(args.query, args.limit)
    print(results)
