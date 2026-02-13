import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      // Provide empty polyfills for Node.js modules that mupdf tries to import
      'node:fs': 'data:text/javascript,export default {}',
      'module': 'data:text/javascript,export default {}',
      'fs': 'data:text/javascript,export default {}',
    }
  },
  optimizeDeps: {
    exclude: ['mupdf'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
})
