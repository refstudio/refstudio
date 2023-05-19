# refstudio

Reference Studio

## Setup
```
$ npm install yarn
$ yarn install
```

For running the python sidecar, you will need to [install poetry](https://python-poetry.org/).

Once you have poetry installed, you can install the python dependencies via:
```
$ poetry install
```

To compile the python sidecar as a binary:
```
$ yarn python
```
This will generate the binary at `src-tauri/bin/python` and append the appropriate [target triple](https://tauri.app/v1/guides/building/sidecar) required by Tauri.

You should then be able to launch the app via:
```
$ yarn tauri dev
```



