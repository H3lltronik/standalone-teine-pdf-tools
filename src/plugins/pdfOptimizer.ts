import type { App, InjectionKey } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import { PDF_WORKER_URL } from '../lib/pdf-worker-url'
import { PDFReader } from '../implementations/pdf-reader'
import { PDFWriter } from '../implementations/pdf-writter'
import { ImageCompressor } from '../implementations/image-compressor'
import { PDFCompressor } from '../implementations/pdf-compressor'
import { PDFOptimizer } from '../core/optimizer/pdf-optimizer'
import type { IPdfReader, IPdfWriter, IImageCompressor, IPdfCompressor } from '../core/types'

const IMAGE_COMPRESSOR_POOL_SIZE = 10

export const PdfOptimizerKeys: {
  pdfReader: InjectionKey<IPdfReader>
  pdfWriter: InjectionKey<IPdfWriter>
  imageCompressor: InjectionKey<IImageCompressor>
  pdfCompressor: InjectionKey<IPdfCompressor>
  pdfOptimizer: InjectionKey<PDFOptimizer>
} = {
  pdfReader: Symbol('pdfReader') as InjectionKey<IPdfReader>,
  pdfWriter: Symbol('pdfWriter') as InjectionKey<IPdfWriter>,
  imageCompressor: Symbol('imageCompressor') as InjectionKey<IImageCompressor>,
  pdfCompressor: Symbol('pdfCompressor') as InjectionKey<IPdfCompressor>,
  pdfOptimizer: Symbol('pdfOptimizer') as InjectionKey<PDFOptimizer>,
}

export interface PdfOptimizerPluginOptions {
  /** Override pool size for ImageCompressor (default 10). */
  imageCompressorPoolSize?: number
}

export function createPdfOptimizerPlugin(options: PdfOptimizerPluginOptions = {}) {
  const poolSize = options.imageCompressorPoolSize ?? IMAGE_COMPRESSOR_POOL_SIZE
  const pdfReader = new PDFReader()
  const pdfWriter = new PDFWriter()
  const imageCompressor = new ImageCompressor(poolSize)
  const pdfCompressor = new PDFCompressor()
  const pdfOptimizer = new PDFOptimizer(
    pdfReader,
    pdfWriter,
    imageCompressor,
    pdfCompressor
  )

  pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL

  return {
    install(app: App): void {
      app.provide(PdfOptimizerKeys.pdfReader, pdfReader)
      app.provide(PdfOptimizerKeys.pdfWriter, pdfWriter)
      app.provide(PdfOptimizerKeys.imageCompressor, imageCompressor)
      app.provide(PdfOptimizerKeys.pdfCompressor, pdfCompressor)
      app.provide(PdfOptimizerKeys.pdfOptimizer, pdfOptimizer)
    },
  }
}
