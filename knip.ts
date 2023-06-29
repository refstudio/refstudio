import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['src/main.tsx'],
  project: ['src/**/*.ts', 'src/**/*.tsx'],
  ignore: ['src/api/types.ts', 'src/vite-env.d.ts'],
  exclude: ['types'],
  ignoreBinaries: ['poetry'],
};

export default config;
