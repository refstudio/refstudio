"""
to run the script, use the following command:

```
python search.py -q "machine learning"
 ```

This is the structure of the response:

```json
{
  "total": 0,
  "offset": 0,
  "next": 0,
  "data": [
    {
      "paperId": "",
      "title": "",
      "abstract": "",
      "venue": "",
      "year": 0
    },
    . . .
  ]
}
```

"""
import nltk
import argparse
import requests
import os

s2_api_key = os.environ.get("S2_API_KEY")


class SearchSemanticScholar:
    # Declaring stopwords as a class variable
    nltk.download("stopwords")
    from nltk.corpus import stopwords

    stopwords = set(stopwords.words("english"))
    # add more stopwords here
    stopwords.update(["please", "review"])

    def __init__(self, api_key):
        self.api_key = api_key

    # Removes unnecessary words from search query
    def preprocess_query(self, query):
        query = query.lower()
        # remove stopwords from the query
        query = " ".join([word for word in query.split() if word not in self.stopwords])
        # space between the query is removed, replaced with '+'
        query = query.replace(" ", "+")
        return query

    # Performs a search
    def search(self, query, limit=20, fields=["title", "abstract", "venue", "year"]):
        query = self.preprocess_query(query)
        url = f'https://api.semanticscholar.org/graph/v1/paper/search?query={query}&limit={limit}&fields={",".join(fields)}'
        headers = {"Accept": "*/*", "x-api-key": self.api_key}
        response = requests.get(url, headers=headers, timeout=30)
        return response.json()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Semantic Scholar Paper Search")
    parser.add_argument(
        "-q",
        "--query",
        type=str,
        required=True,
        help="search query",
        default="machine learning",
    )
    parser.add_argument(
        "-l",
        "--limit",
        type=int,
        default=20,
        help="number of search results to return",
    )
    parser.add_argument(
        "-ak",
        "--api_key",
        type=str,
        required=True,
        help="S2 API key",
        default=s2_api_key,
    )
    args = parser.parse_args()

    paper_search = SearchSemanticScholar(args.api_key)
    result = paper_search.search(args.query, args.limit)
    print(result)
