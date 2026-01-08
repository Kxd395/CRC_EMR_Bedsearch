import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  preview: {
    port: 4173,
    open: false
  },
  server: {
    port: 5173,
    open: false
  }
});
