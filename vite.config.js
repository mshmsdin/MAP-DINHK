import { defineConfig } from 'vite';

export default defineConfig({
  // المسار الأساسي للنشر على المسار الفرعي din.hk/map
  base: process.env.VITE_BASE || '/map/',
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
