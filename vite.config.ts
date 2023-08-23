import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // prevent vite from obscuring rust errors
  clearScreen: false,
  // tauri expects a fixed port, fail if that port is not available
  server: {
    port: process.env.VITE_PORT ? parseInt(process.env.VITE_PORT) : 1420,
    strictPort: true,
    proxy: {
      '/api': 'http://127.0.0.1:8000',
    },
  },
  // to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    // Tauri supports es2021
    target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,

    rollupOptions: {
      input: {
        index: './index.html',
        splashscreen: './splashscreen.html',
      },
    },
  },
  test: {
    coverage: {
      provider: 'c8',
      // Instrument all files: https://github.com/bcoe/c8#checking-for-full-source-coverage-using---all
      all: true,
      include: ['src/**'],
      exclude: [
        'src/**/types.ts',
        'src/**/__tests__/**',
        'src/**/types/**.ts',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.d.ts',
      ],
    },
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    // you might want to disable it, if you don't have tests that rely on CSS
    // since parsing CSS is slow
    css: true,
  },
}));
