import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The sidebar HTML is the sole entry point — everything goes to dist/sidebar/
  root: resolve(__dirname, 'src/sidebar'),
  build: {
    outDir: resolve(__dirname, 'dist/sidebar'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/sidebar/index.html'),
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  // Dev server for testing sidebar standalone
  server: {
    port: 5173,
  },
})
