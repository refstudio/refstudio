import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['src/main.tsx'],
  project: ['src/**/*.ts', 'src/**/*.tsx'],
  ignore: ['src/api/types.ts'],
};

export default config;
