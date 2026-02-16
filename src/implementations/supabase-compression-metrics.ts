import type { SupabaseClient } from '@supabase/supabase-js'
import type { ICompressionMetricsService } from '../core/metrics/compression-metrics-service'
import type { CompressionMetricsPayload } from '../core/metrics/types'

const DEFAULT_TABLE_NAME = 'compression_metrics'

export interface SupabaseCompressionMetricsOptions {
  tableName?: string
}

export class SupabaseCompressionMetricsService implements ICompressionMetricsService {
  private readonly tableName: string

  constructor(
    private readonly supabase: SupabaseClient,
    options: SupabaseCompressionMetricsOptions = {}
  ) {
    this.tableName = options.tableName ?? DEFAULT_TABLE_NAME
  }

  async recordCompressionMetrics(payload: CompressionMetricsPayload): Promise<void> {
    const row = this.toRow(payload)
    const { error } = await this.supabase.from(this.tableName).insert(row)
    if (error) {
      console.error('[SupabaseCompressionMetrics] insert failed:', error.message)
      throw error
    }
  }

  private toRow(payload: CompressionMetricsPayload): Record<string, unknown> {
    const { summary, iterations } = payload
    const row: Record<string, unknown> = {
      initial_size_bytes: summary.initialSizeBytes,
      target_size_bytes: summary.targetSizeBytes,
      final_size_bytes: summary.finalSizeBytes,
      size_ratio: summary.sizeRatio,
      target_achieved: summary.targetAchieved,
      total_duration_ms: summary.totalDurationMs,
      page_count: summary.pageCount,
      iterations_used: summary.iterationsUsed,
      final_aggression: summary.finalAggression,
      optimizer_options: {
        maxIterations: summary.optimizerOptions.maxIterations,
        toleranceRatio: summary.optimizerOptions.toleranceRatio,
        intervalEpsilon: summary.optimizerOptions.intervalEpsilon,
      },
      iterations: iterations.map((it) => ({
        iteration_index: it.iterationIndex,
        aggression: it.aggression,
        image_options: it.imageOptions,
        pdf_options: it.pdfOptions,
        result_size_bytes: it.resultSizeBytes,
        iteration_duration_ms: it.iterationDurationMs,
      })),
    }
    if (summary.pageAggregates) {
      row.total_render_ms = summary.pageAggregates.totalRenderMs
      row.total_compress_images_ms = summary.pageAggregates.totalCompressImagesMs
      row.sum_input_image_bytes = summary.pageAggregates.sumInputImageBytes
      row.sum_compressed_image_bytes = summary.pageAggregates.sumCompressedImageBytes
    }
    return row
  }
}
