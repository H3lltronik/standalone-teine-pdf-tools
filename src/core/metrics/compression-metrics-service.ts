import type { CompressionMetricsPayload } from './types'

/**
 * Abstraction for recording compression metrics.
 * Implementations can persist to Supabase, a custom backend, or no-op when disabled.
 */
export interface ICompressionMetricsService {
  /**
   * Records one compression run (summary + iteration details).
   * Non-blocking: implementations may fire-and-forget or await; callers should not depend on success.
   */
  recordCompressionMetrics(payload: CompressionMetricsPayload): Promise<void>
}
