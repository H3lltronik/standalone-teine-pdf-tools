import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'

// @quicktoolsone/pdf-compress loads pdf.js worker from /pdf.js/pdf.worker.min.mjs.
// Serve it from the library's dist so the worker version matches (avoids 404 / wrong MIME).
const pdfWorkerPath = path.resolve(
  __dirname,
  'node_modules/@quicktoolsone/pdf-compress/dist/pdf.js/pdf.worker.min.mjs'
)

function servePdfWorker() {
  return {
    name: 'serve-pdf-worker',
    configureServer(server: { middlewares: { use: (fn: (req: unknown, res: unknown, next: () => void) => void) => void } }) {
      server.middlewares.use((req: unknown, res: unknown, next: () => void) => {
        const r = req as { url?: string; method?: string }
        const w = res as { setHeader: (n: string, v: string) => void; end: (b: Buffer) => void }
        if (r.method !== 'GET' || !r.url?.startsWith('/pdf.js/pdf.worker')) return next()
        try {
          const data = fs.readFileSync(pdfWorkerPath)
          w.setHeader('Content-Type', 'application/javascript')
          w.setHeader('Cache-Control', 'public, max-age=3600')
          w.end(data)
        } catch {
          next()
        }
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true, // listen on 0.0.0.0 so both IPv4 (127.0.0.1) and IPv6 (::1) work
  },
  plugins: [
    servePdfWorker(),
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