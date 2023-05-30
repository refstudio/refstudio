# Reference Studio


## Setup

```bash
$ yarn install
```

### Python

For running the python sidecar, you will need to [install poetry](https://python-poetry.org/).

Once you have poetry installed, you can install the python dependencies via:

```bash
$ poetry install
```

To compile the python sidecar as a binary:
```bash
$ yarn python
```

Assuming you are in the root project directory (`refstudio`), you can run the Python tests and generate a coverage report by:
```bash
$ poetry run pytest --cov=python python/tests
```

This will generate the binary at `src-tauri/bin/python` and append the appropriate [target triple](https://tauri.app/v1/guides/building/sidecar) required by Tauri.


## Development

You should then be able to launch the app via:
```bash
$ yarn tauri:dev
```

### Debug

To automatically open the browser devtools you can launch the app via:

```bash
$ yarn tauri:dev:debug
```

