#!/usr/bin/env bash

set -o errexit
set -x

poetry run python python/generate_schema.py
yarn run json2ts python/cli.schema.json --no-additionalProperties > src/api/types.ts
yarn run json2ts python/api.schema.json --no-additionalProperties --unreachableDefinitions > src/api/api-types.ts
yarn prettier --config package.json --write src/api/types.ts src/api/api-types.ts

# Fail on CI if there are any diffs.
git diff --exit-code python/api.schema.json python/cli.schema.json src/api/api-types.ts src/api/types.ts
