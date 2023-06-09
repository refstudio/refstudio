# Reference Studio

## Setup

```bash
$ yarn install
```

### Python

For running the Python sidecar, you will need to [install poetry](https://python-poetry.org/).

Once you have poetry installed, you can install the Python dependencies via:

```bash
$ poetry install
```

To compile the Python sidecar as a binary:
```bash
$ yarn python
```

Assuming you are in the root project directory (`refstudio`), you can run the Python tests and generate a coverage report by:
```bash
$ poetry run pytest --cov=python python/tests
```

This will generate the binary at `src-tauri/bin/python` and append the appropriate [target triple](https://tauri.app/v1/guides/building/sidecar) required by Tauri.

You can read more details about the Python backend implementation [here](/python/README.md).

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

You can find logs from the Python sidecar in `/tmp/refstudio-sidecar.log`.

### Reset

To reset your local environment you should following these steps:

* run `./scripts/reset_uploads.sh` to reset the references backend and uploads
* run `yarn install && poetry install && yarn python` to make sure both the FE and BE are up-to-date
* run `yarn tauri:dev` to run the app
* upload new reference PDFs

Project state is persisted in the Tauri [`appDataDir`][appDataDir], typically `~/Library/Application\ Support/com.tauri.dev`.
To completely reset app state, quit the RefStudio app and remove this directory:

```bash
$ mv ~/Library/Application\ Support/com.tauri.dev /tmp/
```

[appDataDir]: https://tauri.app/v1/api/js/path#appdatadir
