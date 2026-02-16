import type {
  ImageCompressionOptions,
  PdfCompressionOptions,
  PdfFile,
} from '../types'
import type { CompressionIterationMetric, PageAggregates } from '../metrics/types'
import { getLoggerFor } from '../../lib/logger'
import { TaskTimer } from '../../lib/promise-pool'
import type { PDFOptimizer } from './pdf-optimizer'

const log = getLoggerFor(['optimizer', 'size-target'])

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/**
 * Maps aggression [0,1] to image options. At t=1 we use extreme values so that
 * very small targets (e.g. 50MB→1KB) are reachable in one pass.
 */
function aggressionToImageOptions(aggression: number): ImageCompressionOptions {
  const t = Math.max(0, Math.min(1, aggression))
  const maxDim = Math.round(lerp(2400, 200, t))
  return {
    maxSizeMB: lerp(0.6, 0.02, t),
    quality: lerp(0.92, 0.12, t),
    maxWidth: maxDim,
    maxHeight: maxDim,
  }
}

/**
 * Maps aggression [0,1] to PDF compression options. At t=1 we use max preset
 * and low quality/DPI so extreme size targets are reachable.
 */
function aggressionToPdfOptions(aggression: number): PdfCompressionOptions {
  const t = Math.max(0, Math.min(1, aggression))
  const preset: PdfCompressionOptions['preset'] =
    t <= 0.35 ? 'lossless' : t <= 0.7 ? 'balanced' : 'max'
  return {
    jpegQuality: lerp(0.9, 0.2, t),
    targetDPI: Math.round(lerp(150, 72, t)),
    preserveMetadata: false,
    preset,
  }
}

export interface PdfSizeTargetOptimizerOptions {
  maxIterations?: number
  /** Consider done when result is within this ratio of target (e.g. 0.1 = 10%). */
  toleranceRatio?: number
  /** Stop when search interval is smaller than this (e.g. 0.05). */
  intervalEpsilon?: number
}

/** Minimum high bound so we always have a non-trivial search range. */
const MIN_HIGH_AGGRESSION = 0.05

/**
 * Derives max aggression from required size ratio. Small reduction (e.g. 4MB→2MB)
 * → low max aggression; large reduction (e.g. 50MB→1KB) → max aggression 1.
 */
function maxAggressionForRatio(targetSizeBytes: number, initialSizeBytes: number): number {
  if (initialSizeBytes <= 0) return 1
  const ratio = targetSizeBytes / initialSizeBytes
  const high = 1 - ratio
  return Math.min(1, Math.max(MIN_HIGH_AGGRESSION, high))
}

export class PdfSizeTargetOptimizer {
  private iteration = 0
  private low = 0
  private high: number
  private lastAggression = 0.5
  private done = false
  private lastSizeBytes: number = Infinity
  private lastProcessDurationMs: number | null = null

  private readonly maxIterations: number
  private readonly toleranceRatio: number
  private readonly intervalEpsilon: number

  /** Current PDF result; null until first compress run. */
  private pdfFile: PdfFile | null = null

  private readonly iterationMetrics: CompressionIterationMetric[] = []
  private lastPageAggregates: PageAggregates | null = null

  constructor(
    private readonly pdfOptimizer: PDFOptimizer,
    private readonly initialBuffer: ArrayBuffer,
    private readonly targetSizeBytes: number,
    options: PdfSizeTargetOptimizerOptions = {}
  ) {
    this.high = maxAggressionForRatio(targetSizeBytes, initialBuffer.byteLength)
    this.maxIterations = options.maxIterations ?? 5
    this.toleranceRatio = options.toleranceRatio ?? 0.1
    this.intervalEpsilon = options.intervalEpsilon ?? 0.05
  }

  /**
   * Always use a copy of the original so binary search is over compress(original, A).
   * We return a copy because pdf.js may transfer the buffer to a worker (detaching it).
   */
  private getCurrentBuffer(): ArrayBuffer {
    return this.initialBuffer.slice(0)
  }

  getNextAggression(): number | null {
    if (this.done) return null
    if (this.iteration >= this.maxIterations || this.lastSizeBytes <= this.targetSizeBytes) {
      this.done = true
      return null
    }
    if (this.iteration === 0) {
      this.iteration++
      this.lastAggression = 0
      return 0
    }
    if (this.iteration === 1) {
      this.iteration++
      this.lastAggression = this.high
      return this.high
    }
    const mid = (this.low + this.high) / 2
    if (this.high - this.low < this.intervalEpsilon) {
      this.done = true
      return null
    }
    this.iteration++
    this.lastAggression = mid
    return mid
  }

  updateLastResult(pdf: PdfFile): void {
    const size = pdf.getArrayBuffer().byteLength
    const hadUnderTarget =
      this.lastSizeBytes !== Infinity && this.lastSizeBytes <= this.targetSizeBytes

    if (size <= this.targetSizeBytes) {
      this.pdfFile = pdf
      this.lastSizeBytes = size
      this.high = this.lastAggression
      const toleranceBytes = this.targetSizeBytes * this.toleranceRatio
      if (size >= this.targetSizeBytes - toleranceBytes) this.done = true
    } else {
      this.low = this.lastAggression
      if (!hadUnderTarget) {
        this.pdfFile = pdf
        this.lastSizeBytes = size
      }
    }
  }

  /**
   * Run binary search until size is at or below target (or max iterations / interval epsilon).
   * Returns the last compressed PdfFile (best quality that met the target, or closest).
   */
  async process(params?: { onProgress?: (p: number) => void }): Promise<PdfFile> {
    const onProgress = params?.onProgress
    const totalTimer = new TaskTimer()
    let iterationIndex = 0

    while (!this.done) {
      const aggression = this.getNextAggression()
      if (aggression === null) break

      const iterTimer = new TaskTimer()
      const imageOptions = aggressionToImageOptions(aggression)
      const pdfOptions = aggressionToPdfOptions(aggression)
      const pdf = await this.pdfOptimizer.compress(
        this.getCurrentBuffer(),
        imageOptions,
        pdfOptions,
        onProgress,
        (agg) => {
          this.lastPageAggregates = agg
        }
      )
      this.updateLastResult(pdf)

      const iterMs = Math.round(iterTimer.elapsedMs() * 10) / 10
      const resultSizeBytes = this.lastSizeBytes !== Infinity ? this.lastSizeBytes : 0
      this.iterationMetrics.push({
        iterationIndex,
        aggression,
        imageOptions: { ...imageOptions },
        pdfOptions: { ...pdfOptions },
        resultSizeBytes,
        iterationDurationMs: iterMs,
      })
      const sizeMb = this.lastSizeBytes != null ? (this.lastSizeBytes / 1024 / 1024).toFixed(2) : '—'
      log.info`PdfSizeTargetOptimizer iteration ${iterationIndex}: ${iterMs}ms, size ${sizeMb}MB`
      iterationIndex++
    }

    this.lastProcessDurationMs = Math.round(totalTimer.elapsedMs() * 10) / 10
    log.debug`PdfSizeTargetOptimizer total: ${this.lastProcessDurationMs}ms (${iterationIndex} iterations)`
    if (!this.pdfFile) {
      throw new Error('PdfSizeTargetOptimizer: no result (maxIterations may be 0)')
    }
    return this.pdfFile
  }

  getLastSizeBytes(): number | null {
    return this.lastSizeBytes
  }

  getLastAggression(): number {
    return this.lastAggression
  }

  /** Total duration in ms of the last process() run, or null if not run yet. */
  getLastProcessDurationMs(): number | null {
    return this.lastProcessDurationMs
  }

  /** Metrics for each binary-search iteration (for analytics). */
  getIterations(): readonly CompressionIterationMetric[] {
    return this.iterationMetrics
  }

  /** Page-level aggregates from the last compress() run (spec 2.3). */
  getLastPageAggregates(): PageAggregates | null {
    return this.lastPageAggregates
  }
}
