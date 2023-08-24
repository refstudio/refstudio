#!/usr/bin/env bash

set -o errexit
set -x

poetry run python python/generate_schema.py > python/api.schema.json
yarn run json2ts python/api.schema.json --no-additionalProperties --unreachableDefinitions > src/api/api-types.ts
yarn prettier --config package.json --write src/api/api-types.ts

# Fail on CI if there are any diffs.
git diff --exit-code python/cli.schema.json src/api/api-types.ts
