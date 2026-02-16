import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'

// PDF.js worker: ruta fija /pdf.js/pdf.worker.min.mjs para evitar que en hosting (Amplify, etc.)
// la petición al asset con hash reciba index.html (SPA rewrite) y devuelva MIME text/html.
const pdfWorkerSrc = path.resolve(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs')

function servePdfWorker() {
  return {
    name: 'serve-pdf-worker',
    configureServer(server: { middlewares: { use: (fn: (req: unknown, res: unknown, next: () => void) => void) => void } }) {
      server.middlewares.use((req: unknown, res: unknown, next: () => void) => {
        const r = req as { url?: string; method?: string }
        const w = res as { setHeader: (n: string, v: string) => void; end: (b: Buffer) => void }
        if (r.method !== 'GET' || !r.url?.startsWith('/pdf.js/pdf.worker')) return next()
        try {
          const data = fs.readFileSync(pdfWorkerSrc)
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

function copyPdfWorkerToDist() {
  return {
    name: 'copy-pdf-worker',
    closeBundle() {
      const outFile = path.resolve(__dirname, 'dist/pdf.js/pdf.worker.min.mjs')
      const outDir = path.dirname(outFile)
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
      fs.copyFileSync(pdfWorkerSrc, outFile)
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
    copyPdfWorkerToDist(),
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