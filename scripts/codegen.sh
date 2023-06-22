#!/usr/bin/env bash

set -o errexit
set -x

poetry run python python/generate_schema.py > python/cli.schema.json
yarn run json2ts python/cli.schema.json --no-additionalProperties > src/api/types.ts
yarn prettier --config package.json --write src/api/types.ts

# Fail on CI if there are any diffs.
git diff --exit-code python/cli.schema.json src/api/types.ts
