import type { PdfCompressionPreset } from '../types'

/** Snapshot of image compressor params for a single iteration. */
export interface ImageOptionsSnapshot {
  maxSizeMB: number
  quality: number
  maxWidth?: number
  maxHeight?: number
}

/** Snapshot of PDF compressor params for a single iteration. */
export interface PdfOptionsSnapshot {
  jpegQuality: number
  targetDPI: number
  preserveMetadata?: boolean
  preset?: PdfCompressionPreset
}

/** Optimizer search params (maxIterations, toleranceRatio, intervalEpsilon). */
export interface OptimizerOptionsSnapshot {
  maxIterations: number
  toleranceRatio: number
  intervalEpsilon: number
}

/** Aggregates across all pages for one compress() run (spec 2.3). */
export interface PageAggregates {
  totalRenderMs: number
  totalCompressImagesMs: number
  sumInputImageBytes: number
  sumCompressedImageBytes: number
}

/** Single iteration of the size-target binary search. */
export interface CompressionIterationMetric {
  iterationIndex: number
  aggression: number
  imageOptions: ImageOptionsSnapshot
  pdfOptions: PdfOptionsSnapshot
  resultSizeBytes: number
  iterationDurationMs: number
}

/** Summary for one compressed file (one run of PdfSizeTargetOptimizer). */
export interface CompressionSummaryMetric {
  initialSizeBytes: number
  targetSizeBytes: number
  finalSizeBytes: number
  sizeRatio: number
  targetAchieved: boolean
  totalDurationMs: number
  pageCount: number
  iterationsUsed: number
  finalAggression: number
  optimizerOptions: OptimizerOptionsSnapshot
  /** Aggregates from last compress pass (spec 2.3, optional). */
  pageAggregates?: PageAggregates
}

/** Full payload for one compression: summary + per-iteration details. */
export interface CompressionMetricsPayload {
  summary: CompressionSummaryMetric
  iterations: CompressionIterationMetric[]
}

/** Payload for a failed compression run (batch stopped due to error). */
export interface CompressionFailurePayload {
  errorMessage: string
  fileIndex: number
  totalFiles: number
  phase?: 'fetch' | 'page_count' | 'optimize' | 'unknown'
}
