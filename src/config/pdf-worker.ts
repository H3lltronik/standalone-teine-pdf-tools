import * as pdfjsLib from 'pdfjs-dist'

const workerUrl = import.meta.env.VITE_PDF_WORKER_URL as string | undefined

if (!workerUrl || typeof workerUrl !== 'string' || workerUrl.trim() === '') {
  throw new Error(
    'VITE_PDF_WORKER_URL must be set to the PDF.js worker URL (e.g. your S3 public URL for pdf.worker.min.mjs)'
  )
}

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.trim()
