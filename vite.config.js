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
  define: {
    // Define process to make mupdf think it's not in Node.js environment
    'process.versions.node': 'undefined',
    'process.type': 'undefined',
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
