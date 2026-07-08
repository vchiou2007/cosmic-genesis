import { defineConfig } from 'vite';

/**
 * Vite 組態設定
 * Vite Configuration
 *
 * 為了 GitHub Pages 部署，將 base 設為專案名稱。
 * For GitHub Pages deployment, set base to the repository name.
 */
export default defineConfig({
  base: '/cosmic-genesis/',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
