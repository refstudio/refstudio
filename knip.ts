import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['src/main.tsx', 'src/splash.tsx'],
  project: ['src/**/*.ts', 'src/**/*.tsx'],
  ignore: [
    'src/api/types.ts',
    'src/api/api-types.ts',
    'src/api/api-paths.ts',
    'src/vite-env.d.ts',
    'src/**/__mocks__/*.ts',
    'src/declarations/*.d.ts',
  ],
  ignoreBinaries: ['poetry'],
  ignoreExportsUsedInFile: true,
  ignoreDependencies: [
    // Used in scripts/codegen.sh
    'openapi-typescript',
    // referenced in vite.config.ts (`provider: 'c8'`)
    '@vitest/coverage-c8',
    // referenced in scripts/codegen.sh
    'json-schema-to-typescript',
    // Prettier auto-loads this plugin, see https://github.com/webpro/knip/issues/70
    'prettier-plugin-tailwindcss',
  ],
};

export default config;
