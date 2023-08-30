#!/usr/bin/env bash

set -o errexit
set -x

poetry run python python/generate_schema.py
(
    echo '/* eslint-disable */'
    yarn run openapi-typescript python/openapi.json
) > ./src/api/raw-api-types.d.ts
yarn prettier --config package.json --write ./src/api/raw-api-types.d.ts ./src/api/api-types.ts

# Fail on CI if there are any diffs.
git diff --exit-code python/openapi.json ./src/api/raw-api-types.d.ts ./src/api/api-types.ts
