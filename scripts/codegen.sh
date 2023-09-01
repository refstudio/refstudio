#!/usr/bin/env bash

set -o errexit
set -x

poetry run python python/generate_schema.py
yarn run openapi-typescript --alphabetize python/openapi.json > ./src/api/api-paths.ts

yarn run json2ts python/api.schema.json --no-additionalProperties --unreachableDefinitions > src/api/api-types.ts
yarn prettier --config package.json --write ./src/api/api-paths.ts ./src/api/api-types.ts

poetry run python python/codegen_cleanup.py
yarn prettier --config package.json --write ./src/api/api-paths.ts

# Fail on CI if there are any diffs.
git diff --exit-code python/openapi.json python/api.schema.json src/api/api-paths.ts src/api/api-types.ts
