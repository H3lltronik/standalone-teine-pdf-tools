import { inject } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import { PdfOptimizerKeys } from '../plugins/pdfOptimizer'
import { CompressionMetricsKeys } from '../plugins/compressionMetrics'
import { PdfSizeTargetOptimizer } from '../core/optimizer/pdf-size-target-optimizer'
import type { PDFOptimizer } from '../core/optimizer/pdf-optimizer'
import type { IPdfReader } from '../core/types'
import type { CompressionMetricsPayload } from '../core/metrics/types'
import { useCompressionSettingsStore } from '../stores/compressionSettings'
import { ArrayBufferFetcher } from '../lib/array-buffer-fetcher'
import { fileWeightUtils } from '../lib/file-weight-utils'
import { getLoggerFor } from '../lib/logger'

const log = getLoggerFor('compression-batch')

const OPTIMIZER_OPTIONS = {
  maxIterations: 5,
  toleranceRatio: 0.1,
  intervalEpsilon: 0.05,
}

async function getPageCount(pdfReader: IPdfReader, arrayBuffer: ArrayBuffer): Promise<number> {
  const pdf = await pdfReader.load(arrayBuffer.slice(0), { keepBufferCopy: false })
  try {
    const pages = await pdf.getPages()
    return pages.length
  } finally {
    pdf.destroy?.()
  }
}

export function useCompressionBatch() {
  const pdfOptimizer = inject<PDFOptimizer>(PdfOptimizerKeys.pdfOptimizer)!
  const pdfReader = inject<IPdfReader>(PdfOptimizerKeys.pdfReader)
  const metricsService = inject(CompressionMetricsKeys.compressionMetricsService)
  const store = useCompressionSettingsStore()

  if (!pdfOptimizer) {
    throw new Error('useCompressionBatch requires PdfOptimizer plugin (pdfOptimizer)')
  }

  async function runBatch(params?: { onProgress?: (fileIndex: number, total: number) => void }): Promise<void> {
    const files = [...store.files]
    if (files.length === 0) return

    store.setCompressing(true)
    store.clearOptimizedBlobs()
    store.setProgress(0, files.length)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file) continue

        store.setFileLoading(file.id, true)
        params?.onProgress?.(i, files.length)

        try {
          const arrayBuffer = await ArrayBufferFetcher.fromFileSource(file.source)
          const initialSizeBytes = arrayBuffer.byteLength
          const targetBytes = Math.max(1, Math.round(fileWeightUtils.targetWeightToBytes(file.targetWeight)))

          const pageCount = pdfReader
            ? await getPageCount(pdfReader, arrayBuffer)
            : 0

          const targetOptimizer = new PdfSizeTargetOptimizer(
            pdfOptimizer,
            arrayBuffer,
            targetBytes,
            OPTIMIZER_OPTIONS
          )

          const resultPdf = await targetOptimizer.process()
          const buffer = resultPdf.getArrayBuffer()
          const finalSizeBytes = buffer.byteLength
          const blob = new Blob([buffer], { type: 'application/pdf' })
          store.setFileOptimizedBlob(file.id, blob)

          if (metricsService) {
            const totalDurationMs = targetOptimizer.getLastProcessDurationMs() ?? 0
            const lastSizeBytes = targetOptimizer.getLastSizeBytes()
            const finalSize = lastSizeBytes !== null ? lastSizeBytes : finalSizeBytes
            const pageAggregates = targetOptimizer.getLastPageAggregates()
            const payload: CompressionMetricsPayload = {
              summary: {
                initialSizeBytes,
                targetSizeBytes: targetBytes,
                finalSizeBytes: finalSize,
                sizeRatio: initialSizeBytes > 0 ? finalSize / initialSizeBytes : 0,
                targetAchieved: finalSize <= targetBytes,
                totalDurationMs,
                pageCount,
                iterationsUsed: targetOptimizer.getIterations().length,
                finalAggression: targetOptimizer.getLastAggression(),
                optimizerOptions: { ...OPTIMIZER_OPTIONS },
                ...(pageAggregates && { pageAggregates }),
              },
              iterations: [...targetOptimizer.getIterations()],
            }
            metricsService.recordCompressionMetrics(payload).catch((err) => {
              log.warn('Failed to record compression metrics: {message}', { message: (err as Error).message })
            })
          }
        } finally {
          store.setFileLoading(file.id, false)
        }
        store.setProgress(i + 1, files.length)
      }
    } finally {
      store.setCompressing(false)
    }
  }

  return { runBatch }
}
