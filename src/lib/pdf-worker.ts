import * as pdfjsLib from 'pdfjs-dist'

/** Ruta fija al worker para que el host (p. ej. Amplify) sirva el .mjs y no reescriba a index.html (MIME text/html). */
const base = import.meta.env.BASE_URL
pdfjsLib.GlobalWorkerOptions.workerSrc = `${base}pdf.js/pdf.worker.min.mjs`
