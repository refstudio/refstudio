// vite.config.ts
import react from "file:///Users/cguedes/Documents/cguedes/Projects/refstudio/refstudio/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { defineConfig } from "file:///Users/cguedes/Documents/cguedes/Projects/refstudio/refstudio/node_modules/vite/dist/node/index.js";
var vite_config_default = defineConfig(async () => ({
  plugins: [react()],
  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // prevent vite from obscuring rust errors
  clearScreen: false,
  // tauri expects a fixed port, fail if that port is not available
  server: {
    port: process.env.VITE_PORT ? parseInt(process.env.VITE_PORT) : 1420,
    strictPort: true,
    proxy: {
      "/api": "http://127.0.0.1:8000"
    }
  },
  // to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    // Tauri supports es2021
    target: process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari13",
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
    rollupOptions: {
      input: {
        index: "./index.html",
        splashscreen: "./splashscreen.html"
      }
    }
  },
  test: {
    coverage: {
      provider: "c8",
      // Instrument all files: https://github.com/bcoe/c8#checking-for-full-source-coverage-using---all
      all: true,
      include: ["src/**"],
      exclude: [
        // Generated code
        "src/**/types.ts",
        "src/**/api-paths.ts",
        "src/**/api-types.ts",
        "src/**/types/**.ts",
        // Tests
        "src/**/__tests__/**",
        "src/**/*.test.{ts,tsx}",
        // Type declarations
        "src/**/*.d.ts"
      ]
    },
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    // you might want to disable it, if you don't have tests that rely on CSS
    // since parsing CSS is slow
    css: true
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvY2d1ZWRlcy9Eb2N1bWVudHMvY2d1ZWRlcy9Qcm9qZWN0cy9yZWZzdHVkaW8vcmVmc3R1ZGlvXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvY2d1ZWRlcy9Eb2N1bWVudHMvY2d1ZWRlcy9Qcm9qZWN0cy9yZWZzdHVkaW8vcmVmc3R1ZGlvL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9jZ3VlZGVzL0RvY3VtZW50cy9jZ3VlZGVzL1Byb2plY3RzL3JlZnN0dWRpby9yZWZzdHVkaW8vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoYXN5bmMgKCkgPT4gKHtcbiAgcGx1Z2luczogW3JlYWN0KCldLFxuXG4gIC8vIFZpdGUgb3B0aW9ucyB0YWlsb3JlZCBmb3IgVGF1cmkgZGV2ZWxvcG1lbnQgYW5kIG9ubHkgYXBwbGllZCBpbiBgdGF1cmkgZGV2YCBvciBgdGF1cmkgYnVpbGRgXG4gIC8vIHByZXZlbnQgdml0ZSBmcm9tIG9ic2N1cmluZyBydXN0IGVycm9yc1xuICBjbGVhclNjcmVlbjogZmFsc2UsXG4gIC8vIHRhdXJpIGV4cGVjdHMgYSBmaXhlZCBwb3J0LCBmYWlsIGlmIHRoYXQgcG9ydCBpcyBub3QgYXZhaWxhYmxlXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IHByb2Nlc3MuZW52LlZJVEVfUE9SVCA/IHBhcnNlSW50KHByb2Nlc3MuZW52LlZJVEVfUE9SVCkgOiAxNDIwLFxuICAgIHN0cmljdFBvcnQ6IHRydWUsXG4gICAgcHJveHk6IHtcbiAgICAgICcvYXBpJzogJ2h0dHA6Ly8xMjcuMC4wLjE6ODAwMCcsXG4gICAgfSxcbiAgfSxcbiAgLy8gdG8gbWFrZSB1c2Ugb2YgYFRBVVJJX0RFQlVHYCBhbmQgb3RoZXIgZW52IHZhcmlhYmxlc1xuICAvLyBodHRwczovL3RhdXJpLnN0dWRpby92MS9hcGkvY29uZmlnI2J1aWxkY29uZmlnLmJlZm9yZWRldmNvbW1hbmRcbiAgZW52UHJlZml4OiBbJ1ZJVEVfJywgJ1RBVVJJXyddLFxuICBidWlsZDoge1xuICAgIC8vIFRhdXJpIHN1cHBvcnRzIGVzMjAyMVxuICAgIHRhcmdldDogcHJvY2Vzcy5lbnYuVEFVUklfUExBVEZPUk0gPT0gJ3dpbmRvd3MnID8gJ2Nocm9tZTEwNScgOiAnc2FmYXJpMTMnLFxuICAgIC8vIGRvbid0IG1pbmlmeSBmb3IgZGVidWcgYnVpbGRzXG4gICAgbWluaWZ5OiAhcHJvY2Vzcy5lbnYuVEFVUklfREVCVUcgPyAnZXNidWlsZCcgOiBmYWxzZSxcbiAgICAvLyBwcm9kdWNlIHNvdXJjZW1hcHMgZm9yIGRlYnVnIGJ1aWxkc1xuICAgIHNvdXJjZW1hcDogISFwcm9jZXNzLmVudi5UQVVSSV9ERUJVRyxcblxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGlucHV0OiB7XG4gICAgICAgIGluZGV4OiAnLi9pbmRleC5odG1sJyxcbiAgICAgICAgc3BsYXNoc2NyZWVuOiAnLi9zcGxhc2hzY3JlZW4uaHRtbCcsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHRlc3Q6IHtcbiAgICBjb3ZlcmFnZToge1xuICAgICAgcHJvdmlkZXI6ICdjOCcsXG4gICAgICAvLyBJbnN0cnVtZW50IGFsbCBmaWxlczogaHR0cHM6Ly9naXRodWIuY29tL2Jjb2UvYzgjY2hlY2tpbmctZm9yLWZ1bGwtc291cmNlLWNvdmVyYWdlLXVzaW5nLS0tYWxsXG4gICAgICBhbGw6IHRydWUsXG4gICAgICBpbmNsdWRlOiBbJ3NyYy8qKiddLFxuICAgICAgZXhjbHVkZTogW1xuICAgICAgICAvLyBHZW5lcmF0ZWQgY29kZVxuICAgICAgICAnc3JjLyoqL3R5cGVzLnRzJyxcbiAgICAgICAgJ3NyYy8qKi9hcGktcGF0aHMudHMnLFxuICAgICAgICAnc3JjLyoqL2FwaS10eXBlcy50cycsXG4gICAgICAgICdzcmMvKiovdHlwZXMvKioudHMnLFxuICAgICAgICAvLyBUZXN0c1xuICAgICAgICAnc3JjLyoqL19fdGVzdHNfXy8qKicsXG4gICAgICAgICdzcmMvKiovKi50ZXN0Lnt0cyx0c3h9JyxcbiAgICAgICAgLy8gVHlwZSBkZWNsYXJhdGlvbnNcbiAgICAgICAgJ3NyYy8qKi8qLmQudHMnLFxuICAgICAgXSxcbiAgICB9LFxuICAgIGdsb2JhbHM6IHRydWUsXG4gICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXG4gICAgc2V0dXBGaWxlczogJy4vc3JjL3Rlc3Qvc2V0dXAudHMnLFxuICAgIC8vIHlvdSBtaWdodCB3YW50IHRvIGRpc2FibGUgaXQsIGlmIHlvdSBkb24ndCBoYXZlIHRlc3RzIHRoYXQgcmVseSBvbiBDU1NcbiAgICAvLyBzaW5jZSBwYXJzaW5nIENTUyBpcyBzbG93XG4gICAgY3NzOiB0cnVlLFxuICB9LFxufSkpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5VyxPQUFPLFdBQVc7QUFDM1gsU0FBUyxvQkFBb0I7QUFHN0IsSUFBTyxzQkFBUSxhQUFhLGFBQWE7QUFBQSxFQUN2QyxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUE7QUFBQTtBQUFBLEVBSWpCLGFBQWE7QUFBQTtBQUFBLEVBRWIsUUFBUTtBQUFBLElBQ04sTUFBTSxRQUFRLElBQUksWUFBWSxTQUFTLFFBQVEsSUFBSSxTQUFTLElBQUk7QUFBQSxJQUNoRSxZQUFZO0FBQUEsSUFDWixPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsSUFDVjtBQUFBLEVBQ0Y7QUFBQTtBQUFBO0FBQUEsRUFHQSxXQUFXLENBQUMsU0FBUyxRQUFRO0FBQUEsRUFDN0IsT0FBTztBQUFBO0FBQUEsSUFFTCxRQUFRLFFBQVEsSUFBSSxrQkFBa0IsWUFBWSxjQUFjO0FBQUE7QUFBQSxJQUVoRSxRQUFRLENBQUMsUUFBUSxJQUFJLGNBQWMsWUFBWTtBQUFBO0FBQUEsSUFFL0MsV0FBVyxDQUFDLENBQUMsUUFBUSxJQUFJO0FBQUEsSUFFekIsZUFBZTtBQUFBLE1BQ2IsT0FBTztBQUFBLFFBQ0wsT0FBTztBQUFBLFFBQ1AsY0FBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNKLFVBQVU7QUFBQSxNQUNSLFVBQVU7QUFBQTtBQUFBLE1BRVYsS0FBSztBQUFBLE1BQ0wsU0FBUyxDQUFDLFFBQVE7QUFBQSxNQUNsQixTQUFTO0FBQUE7QUFBQSxRQUVQO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUE7QUFBQSxRQUVBO0FBQUEsUUFDQTtBQUFBO0FBQUEsUUFFQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsSUFDVCxhQUFhO0FBQUEsSUFDYixZQUFZO0FBQUE7QUFBQTtBQUFBLElBR1osS0FBSztBQUFBLEVBQ1A7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
