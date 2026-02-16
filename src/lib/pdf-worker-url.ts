/**
 * PDF.js worker URL. We serve the worker from public/pdf.js/pdf.worker.min.mjs
 * so it has a stable path and correct MIME type on all hosts (including AWS Amplify).
 * Using the bundled asset (e.g. ?url) can lead to 404 → index.html rewrite and
 * "Expected a JavaScript module script but the server responded with MIME type text/html".
 */
const base = typeof import.meta.env.BASE_URL === 'string' ? import.meta.env.BASE_URL : '/'
export const PDF_WORKER_URL = `${base.replace(/\/$/, '')}/pdf.js/pdf.worker.min.mjs`
