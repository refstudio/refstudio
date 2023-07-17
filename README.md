![Ref Studio](public/readme/readme-refstudio.png)
<p align="center">
  <a href="https://github.com/refstudio/refstudio/actions/workflows/on-push.yml">
    <img src="https://github.com/refstudio/refstudio/actions/workflows/on-push.yml/badge.svg" />
  <a href="https://codecov.io/gh/refstudio/refstudio" > 
   <img src="https://codecov.io/gh/refstudio/refstudio/branch/main/graph/badge.svg?token=XZMTETRGXC"/> 
   </a>
</p>

# Ref Studio

> An open source text editor optimized for writing that relies on references.

## Demo 

public/readme/refstudio-short.mov

## Motivation

Foundation model capabilities are rapidly improving and writing support systems are a promising early use case. Because foundation models are better at fluency than factuality, early experiments have focused on creative writing rather than expository, argumentative, or academic writing. Ref Studio will facilitate experimentation with factual writing support systems by providing an open source text editor that integrates foundation models and referenced document contents.

## Features

Ref Studio has three main components focused on writing, references, and AI interactions.

### Writing

The writing component is supported by a text editor with basic styling with Markdown syntax, Notion-like blocks that can be collapsed, re-arranged, and display associated annotation widgets, such as cited references.

### References

References play a crucial role in scientific document writing. Ref Studio offers a built-in feature for managing references. You have the option to upload your PDF references, which will be analyzed and made easily accessible to assist you throughout the writing process. Additionally, Ref Studio provides a dedicated system interface to efficiently manage your references.

### AI Interactions

When editing documents you can ask AI assistance to rewrite parts of the text, and get answers using the chat. Additionally you can also ask for text completion in the editor.



## Setup & Run

### Prerequisites (development)

- JavaScript: [node.js](https://nodejs.org/en/download) (>= 18.12.0 LTS) and [Yarn](https://yarnpkg.com/getting-started/install) package manager
- Python: (>= 3.11) and [Poetry](https://python-poetry.org/docs/#installation) package manager
- Tauri: Check [prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites/) to install Rust and [Cargo](https://doc.rust-lang.org/stable/cargo/) package manager


### Backend (Python sidecar)

Once you have poetry installed, you can install the Python dependencies via:

```bash
poetry install
```

To compile the Python sidecar as a binary:
```bash
yarn python
```

This will generate the binary at `src-tauri/bin/python` and append the appropriate [target triple](https://tauri.app/v1/guides/building/sidecar) required by Tauri.

You can read more details about the Python backend implementation [here](/python/README.md).

### Frontend (Tauri + TypeScript)

To install the frontend application built with Tauri and Vite + TypeScript you can run:

```bash
yarn install
```

You should then be able to launch the app via:

```bash
yarn tauri:dev
```

#### Debug

To automatically open the browser devtools you can launch the app via:

```bash
$ yarn tauri:dev:debug
```

### Logs

You can find logs from the Python sidecar in `/tmp/refstudio-sidecar.log`.

## Unit tests

### Backend (Python)

Assuming you are in the root project directory, you can run the Python tests and generate a coverage report by:
```bash
poetry run pytest --cov=python python/tests
```
### Frontend (TypeScript)

```bash
yarn install
```

Assuming you are in the root project directory, you can run one of the following scripts

```bash
yarn test
yarn test:watch
yarn test:watch:ui
```


## Reset

To reset your local environment you should following these steps:

* run `./scripts/reset_uploads.sh` to reset the references backend and uploads
* run `yarn install && poetry install && yarn python` to make sure both the FE and BE are up-to-date
* run `yarn tauri:dev` to run the app
* upload new reference PDFs

Project state is persisted in the Tauri [`appDataDir`][appDataDir], typically `~/Library/Application\ Support/com.tauri.dev`.
To completely reset app state, quit the RefStudio app and remove this directory:

```bash
mv ~/Library/Application\ Support/com.tauri.dev /tmp/
```

[appDataDir]: https://tauri.app/v1/api/js/path#appdatadir