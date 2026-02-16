import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

// PDF.js worker is loaded from S3 in both local and prod (VITE_PDF_WORKER_URL).
// It is not bundled; the worker file must not be present in the build output.

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true, // listen on 0.0.0.0 so both IPv4 (127.0.0.1) and IPv6 (::1) work
  },
  plugins: [
    vue(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2015',
  },
})
