import * as pdfjsLib from 'pdfjs-dist'

const workerUrl = import.meta.env.VITE_PDF_WORKER_URL as string | undefined

if (!workerUrl || typeof workerUrl !== 'string' || workerUrl.trim() === '') {
  throw new Error(
    'VITE_PDF_WORKER_URL must be set to the PDF.js worker URL (e.g. your S3 public URL for pdf.worker.min.mjs)'
  )
}

const url = workerUrl.trim()
pdfjsLib.GlobalWorkerOptions.workerSrc = url
// So @quicktoolsone/pdf-compress (patched) uses this URL instead of its hardcoded path
globalThis.PDF_WORKER_URL = url
