import type {
  IPdfReader,
  IPdfWriter,
  IImageCompressor,
  IPdfCompressor,
  ImageCompressionOptions,
  PdfCompressionOptions,
  PdfFile,
  ImageFile,
} from '../types'
import type { PageAggregates } from '../metrics/types'
import { getLoggerFor } from '../../lib/logger'
import { PromisePool, TaskTimer } from '../../lib/promise-pool'

const log = getLoggerFor('optimizer')

const RENDER_POOL_CONCURRENCY = 10

export type onProgressCallback = (p: number) => void

export type onPageAggregatesCallback = (agg: PageAggregates) => void

export class PDFOptimizer {
  constructor(
    private readonly pdfReader: IPdfReader,
    private readonly pdfWriter: IPdfWriter,
    private readonly imageCompressor: IImageCompressor,
    private readonly pdfCompressor: IPdfCompressor
  ) {}

  async compress(
    data: ArrayBuffer,
    imgOpts: ImageCompressionOptions,
    pdfOpts: PdfCompressionOptions,
    onProgress?: onProgressCallback,
    onPageAggregates?: onPageAggregatesCallback
  ): Promise<PdfFile> {
    const pdf = await this.pdfReader.load(data, { keepBufferCopy: false })
    const pages = await pdf.getPages()
    const totalPages = pages.length
    const builder = this.pdfWriter.create()
    const pool = new PromisePool(RENDER_POOL_CONCURRENCY)

    let completedCount = 0
    const reportPageDone = (): void => {
      completedCount += 1
      onProgress?.(Math.round((50 * completedCount) / totalPages))
    }

    interface PageResult {
      image: ImageFile | null
      renderMs: number
      compressMs: number
      inputBytes: number
      compressedBytes: number
    }

    const results = await pool.map(
      pages,
      async (page, index): Promise<PageResult> => {
        const renderTimer = new TaskTimer()
        const image = await page.render(1, {
          maxWidth: imgOpts.maxWidth,
          maxHeight: imgOpts.maxHeight,
        })
        const renderMs = Math.round(renderTimer.elapsedMs() * 10) / 10

        const compressTimer = new TaskTimer()
        const [compressed] = await this.imageCompressor.compress([image], imgOpts)
        const compressMs = Math.round(compressTimer.elapsedMs() * 10) / 10

        const inputBytes = image.data.byteLength
        const compressedBytes = compressed?.data.byteLength ?? 0
        const totalMs = Math.round((renderMs + compressMs) * 10) / 10
        log.debug`Page ${index}: render ${renderMs}ms, compress ${compressMs}ms, total ${totalMs}ms, image size ${inputBytes} bytes, compressed size ${compressedBytes} bytes`
        reportPageDone()
        return { image: compressed ?? null, renderMs, compressMs, inputBytes, compressedBytes }
      }
    )

    if (onPageAggregates) {
      const totalRenderMs = results.reduce((s, r) => s + r.renderMs, 0)
      const totalCompressImagesMs = results.reduce((s, r) => s + r.compressMs, 0)
      const sumInputImageBytes = results.reduce((s, r) => s + r.inputBytes, 0)
      const sumCompressedImageBytes = results.reduce((s, r) => s + r.compressedBytes, 0)
      onPageAggregates({
        totalRenderMs,
        totalCompressImagesMs,
        sumInputImageBytes,
        sumCompressedImageBytes,
      })
    }

    const compressedPages = results.map((r) => r.image)
    for (const img of compressedPages) {
      if (img) await builder.addPage(img)
    }

    if (onProgress) onProgress(50)
    const rebuiltPdf = await builder.output()
    const reportPdfProgress = (p: number) => onProgress?.(50 + Math.round(p / 2))
    pdf.destroy?.()
    return this.pdfCompressor.compress(rebuiltPdf.getArrayBuffer(), pdfOpts, reportPdfProgress)
  }
}