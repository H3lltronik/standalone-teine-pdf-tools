import type { ICompressionMetricsService } from '../core/metrics/compression-metrics-service'
import type { CompressionMetricsPayload } from '../core/metrics/types'

/** No-op implementation when metrics backend is not configured. */
export class NullCompressionMetricsService implements ICompressionMetricsService {
  async recordCompressionMetrics(_payload: CompressionMetricsPayload): Promise<void> {
    // no-op
  }
}
