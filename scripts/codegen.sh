#!/usr/bin/env bash

set -o errexit

poetry run python python/generate_schema.py > python/cli.schema.json
yarn run json2ts python/cli.schema.json --no-additionalProperties > src/api/cli.ts

# Fail on CI if there are any diffs.
git diff --exit-code python/cli.schema.json src/api/cli.ts
