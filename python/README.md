# RefStudio Backend (Tauri Sidecar)

This is the backend for Refstudio. It is written in Python and runs as a [Tauri resource](https://tauri.app/v1/guides/building/resources/).

At a high-level, Tauri allows for "[sidecars](https://tauri.app/v1/guides/building/sidecar/)" written in other languages to be bundled with a Tauri application. These sidecars are typically shipped as an executable that communicates with the Tauri client (front-end) via `stdout`. We create our Python executable via [PyInstaller](https://pyinstaller.org/en/stable/index.html).

For RefStudio, we bundle our Python application as a [resource](https://tauri.app/v1/guides/building/resources) rather than a sidecar as we found the sidecar pattern works best with a single embedded executable. This would have required us to use PyInstaller's [--onefile](https://pyinstaller.org/en/stable/usage.html#cmdoption-F) mode which resulted in the Python app being [significantly more slow](https://github.com/refstudio/refstudio/issues/48#issuecomment-1563627135) than PyInstaller's default [--onedir](https://pyinstaller.org/en/stable/usage.html#cmdoption-D) mode. Bundling the Python app as a _resource_ allowed us to use `--onedir` mode and still use Tauri's [command API](https://tauri.app/v1/api/js/shell#command) to call the application.

## Tooling

We use [poetry](https://python-poetry.org/) for Python dependency management. We also recommend using [pyenv](https://github.com/pyenv/pyenv) for Python version management.

## Setting up Open AI environment variables

```bash
export OPENAI_API_KEY=your_key_here
export OPENAI_CHAT_MODEL='gpt-3.5-turbo'
```

You can add these to your `.bashrc` or `.zshrc` to persist them.

For development, you can also add a `.env` file inside the main refstudio directory (see `.env.example`).

## Development

The following assumes you have already installed [poetry](https://python-poetry.org/docs/).

Install dependencies

```bash
poetry install
```

Building the Python application binary:

```bash
yarn python
```

The above should result in the Python application being placed in `../src-tauri/python/bin`

Running the tests from this directory:

```bash
poetry run pytest --cov=. tests
```

## Commands

The application has the following main functions:

1. Ingest
1. Ingest Status
1. Ingest References
1. Rewrite
1. Chat
1. Delete (References)
1. Update (References)

Parameters to commands are passed in via a single JSON-encoded argument.

### Ingest

`Ingest` is called when a Refstudio user uploads Reference documents.

It takes an input directory containing PDFs and runs an ingestion pipeline. This pipeline uses [Grobid](https://github.com/kermitt2/grobid) to parse the PDFs, converts the resulting `.tei.xml` files to JSON, and performs additional parsing and metadata extraction.

The resulting output of `ingest` is a set of References which are both stored on the filesystem. These References are also communicated back to the Refstudio front-end as JSON via `stdout`.

To run `ingest`:

```bash
poetry run python main.py ingest '{ "pdf_directory": "path/to/docs/" }'
```

```bash
# Example:
$ poetry run python main.py ingest '{ "pdf_directory": "tests/fixtures/pdf/" }' | jq

# Response:
{
  "project_name": "fixtures",
  "references": [
    {
      "source_filename": "test.pdf",
      "title": "A Few Useful Things to Know about Machine Learning",
      "abstract": "... PDF abstract here ...",
      "contents": "... PDF body here ...",
      "authors": [
        {
          "full_name": "Pedro Domingos",
          "given_name": "Pedro",
          "surname": "Domingos",
          "email": "pedrod@cs.washington.edu"
        }
      ],
      "chunks": [
        {
          "text": "... parsed chunks of PDF body ...",
          "vector": [],
          "metadata": {}
        },
        {
          "text": "... parsed chunks of PDF body ...",
          "vector": [],
          "metadata": {}
        }
      ],
      "metadata": {}
    },
    {
      "source_filename": "grobid-fails.pdf",
      "title": null,
      "abstract": null,
      "contents": null,
      "authors": [],
      "chunks": [],
      "metadata": {}
    }
  ]
}
```

### Ingest Status

`ingest_status` is called while `ingest` is running in the background, to check the status of each uploaded file.

It does not take any input and returns a dictionary of various statuses.

To run `ingest_status`:

```bash
poetry run python main.py ingest_status | jq
```

```bash
# Example:
$ poetry run python main.py ingest_status | jq

# Response:
{
  "status": "ok",
  "reference_statuses": [
    {
      "source_filename": "A Few Useful Things to Know about Machine Learning.pdf",
      "status": "complete"
    },
    {
      "source_filename": "2301.10140.pdf",
      "status": "pending"
    },
    {
      "source_filename": "grobid-fails.pdf",
      "status": "failure"
    }
  ]
}
```

### Ingest References

`ingest_references` is called to retrieve reference documents.

It takes an input directory containing PDFs and returns the ingested references. The resulting output of `ingest_references` is a set of References which are both stored on the filesystem.

To run `ingest_references`:

```bash
poetry run python main.py ingest_references '{ "pdf_directory": "path/to/docs/" }'
```

```bash
# Example:
$ poetry run python main.py ingest_references '{ "pdf_directory": "tests/fixtures/pdf/" }' | jq

# Response:
{
  "project_name": "fixtures",
  "references": [
    {
      "source_filename": "test.pdf",
      "title": "A Few Useful Things to Know about Machine Learning",
      "abstract": "... PDF abstract here ...",
      "contents": "... PDF body here ...",
      "authors": [
        {
          "full_name": "Pedro Domingos",
          "given_name": "Pedro",
          "surname": "Domingos",
          "email": "pedrod@cs.washington.edu"
        }
      ],
      "chunks": [
        {
          "text": "... parsed chunks of PDF body ...",
          "vector": [],
          "metadata": {}
        },
        {
          "text": "... parsed chunks of PDF body ...",
          "vector": [],
          "metadata": {}
        }
      ],
      "metadata": {}
    },
    {
      "source_filename": "grobid-fails.pdf",
      "title": null,
      "abstract": null,
      "contents": null,
      "authors": [],
      "chunks": [],
      "metadata": {}
    }
  ]
}
```

### Rewrite

Rewrite is called within the editor pane. It allows a user to ask the AI to concisely rewrite a portion of text for them.

It takes an input of text and returns a list of rewrite `choices`.

To run `rewrite`:

```bash
$ poetry run python main.py rewrite '{"text": "Some text that the user would like to rewrite in a more concise fashion."}'
```

```bash
# Example:
$ poetry run python main.py rewrite '{"text": "In the cycling world, power meters are the typical way to objectively measure performance. Your speed is dependent on a lot of factors, like wind, road surface, and elevation. One'\''s heart rate is largely a function of genetics, but also things like temperature. The amount of power you are outputting to the pedals though, is a direct measure of how much work you'\''re doing, regardless of wind, elevation, your body weight, etc." }' | jq

# Response:
[
  {
    "index": 0,
    "text": "Power meters are the standard method for objectively measuring cycling performance, as they directly measure the amount of work being done regardless of external factors such as wind, elevation, and body weight. Heart rate is influenced by genetics and temperature."
  }
]
```

### Text Completion

Text Completion is called within the editor pane. It allows a user to trigger the LLM to write the next block of text in the document.

It takes an input of text with additional optional parameters and returns a list of `TextCompletionChoice`.

To run `completion`:

```bash

poetry run python main.py completion "{\"text\": \"Machine learning systems automatically learn programs from data. This is often  \", \"n_choices\": 2, \"temperature\": 0.9, \"max_tokens\": 256}" | jq
```

```bash
# Response
[
  {
    "index": 0,
    "text": "referred to as the process of training. During training, these systems are exposed to a vast amount of data and utilize various algorithms to extract patterns and insights. The goal of machine learning is to enable these systems to automatically make informed decisions or predictions without being explicitly programmed for each scenario."
  },
  {
    "index": 1,
    "text": "Machine learning systems automatically learn programs from data. This is often achieved through a process called training, where the machine learning algorithm is provided with a large amount of labeled data and guided to understand patterns and relationships within the dataset."
  }
]
```

### Chat

Chat allows a user to interact with their set of Reference documents (uploaded PDFs).

One example interaction is asking a question about content within the References and having an answer generated.

It takes an input question and returns a response of answer `choices`.

To run `chat`:

```bash
poetry run python main.py chat '{"text": "Some question about information contained with the uploaded reference documents"}'
```

```bash
# Note that we've uploaded a Reference document titled Hidden Technical Debt in Machine Learning Systems (https://proceedings.neurips.cc/paper_files/paper/2015/file/86df7dcfd896fcaf2674f757a2463eba-Paper.pdf)

# Example:
$ poetry run python main.py '{"text": "What can you tell me about hidden feedback loops in machine learning?"}' | jq

# Response:
[
  {
    "index": 0,
    "text": "Hidden feedback loops in machine learning refer to situations where two systems indirectly influence each other through the world, leading to changes in behavior that may not be immediately visible. These loops may exist between completely disjoint systems and can make analyzing the effect of proposed changes extremely difficult, adding cost to even simple improvements. It is recommended to look carefully for hidden feedback loops and remove them whenever feasible."
  }
]
```

### Delete (References)

`delete` removes a Reference from project storage. It is called when a Reference is deleted from the UI.

It takes a list of `source_filenames` as input and returns a response status. Alternatively, you can use the `all` parameter to delete all References in storage.

To run `delete`:

```bash
poetry run python main.py delete '{ "source_filenames": ["grobid-fails.pdf", "Machine Learning at Scale.pdf"] }'
```

```bash
# Example:
$ poetry run python main.py delete '{ "source_filenames": ["grobid-fails.pdf", "Machine Learning at Scale.pdf"] }' | jq

# Response:
{
  "status": "ok",
  "message": ""
}

# Another Example (error):
$ poetry run python main.py delete '{ "source_filenames": ["file-does-not-exist.pdf"] }' | jq

# Error Response:
{
  "status": "error",
  "message": "Unable to delete file-does-not-exist.pdf: not found in storage"
}
```

### Update (References)

`Update` updates a Reference's metadata in project storage. It is called when a user updates details about a Reference.

Its input argument has a key for `source_filename` and `patch`. `source_filename` acts as the unique ID for the Reference to update and `patch` is a dictionary containing the corresponding fields and values to be used for the update.

To run `update`:

```bash
poetry run python main.py update '{"source_filename": "grobid-fails.pdf", "patch": {"title": "a title that was missing"}}'
```

```bash
# Example:
$ poetry run python main.py update '{"source_filename": "grobid-fails.pdf", "patch": {"title": "a title that was missing"}}'
| jq

# Response:
{
  "status": "ok",
  "message": ""
}

# Another Example (error):
$ poetry run python main.py update '{"source_filename": "does-not-exist.pdf", "patch": {"title": "a different title than before"}}' | jq

# Response (error)
{
  "status": "error",
  "message": "Unable to update does-not-exist.pdf: not found in storage"
}

# Full example showing the update
$ cat .storage/references.json | jq '.[] | select(.source_filename | contains("fails")) | {"source_filename": .source_filename, "title": .title}'

{
  "source_filename": "grobid-fails.pdf",
  "title": null
}

# run the update
$ poetry run python main.py update '{"source_filename": "grobid-fails.pdf", "patch": {"title": "a title that was missing"}}'

{
  "status": "ok",
  "message": ""
}

# check that it worked
$ cat .storage/references.json | jq '.[] | select(.source_filename | contains("fails")) | {"source_filename": .source_filename, "title": .title}'

{
  "source_filename": "grobid-fails.pdf",
  "title": "a title that was missing"
}
```

### Search (Semantic Scholar)

`search` queries the Semantic Scholar API for a given query string.

```bash
poetry run python main.py search '{ "query": "your search query", "limit": 1 }' | jq
```

```json
{
  "status": "ok",
  "results": [
    {
      "title": "Search Query Extension Semantics",
      "abstract": "The problems of extracting the most complete information from the semantic library by accounting for related documents are considered. Expert knowledge encrypted in the subject area can be made available when the user obtains additional information from linked documents. A feature of the approach is the use of a shallow neural network algorithm to expand the search query in mathematical subject areas, where expert knowledge is available with a significant scientific background of users. The solution to this problem can be achieved by means of semantic analysis in the knowledge space using machine learning algorithms. The paper investigates the construction of a vector representation of documents based on paragraphs in relation to the data array of the digital semantic library LibMeta. Each piece of text is labelled. Both the whole document and its separate parts can be marked. Since the problem of enriching user queries with synonyms was solved, when building a search model in conjunction with word2vec algorithms, an approach of “indexing first, then training” was used to cover more information and give more accurate results.",
      "venue": "International Conference on Data Analytics and Management in Data Intensive Domains",
      "year": 2021,
      "paperId": "646b1c1574c5d72bd102278cedb47f7c2c9577a1",
      "citationCount": 0,
      "openAccessPdf": null,
      "authors": ["O. Ataeva", "V. Serebriakov", "N. Tuchkova"]
    }
  ]
}
```
