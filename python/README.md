# Sidecar

This is the backend for refstudio. It is written in Python and runs as a [Tauri sidecar](https://tauri.app/v1/guides/building/sidecar/).


## Development

Running the sidecar:
```bash
$ poetry run python -m sidecar --text "Hello, world!"
# {"num_words": 2}
```

Running the tests:
```bash
$ poetry run pytest --cov=sidecar tests
```

Building the sidecar binary:
```bash
$ yarn python
```
