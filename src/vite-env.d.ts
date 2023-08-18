/// <reference types="vite/client" />

// See https://vitejs.dev/guide/env-and-mode.html#intellisense-for-typescript
interface ImportMetaEnv {
  readonly VITE_IS_WEB?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
