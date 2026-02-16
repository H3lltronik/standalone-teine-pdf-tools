import { trackEvent as track, isEnabled } from '@/lib/analytics'
import type {
  AnalyticsEventName,
  AnalyticsEventParams,
  ToolClickParams,
  CompressionFilesAddedParams,
  CompressionBatchParams,
  CompressionBatchCompletedParams,
  TourStartedParams,
} from '@/lib/analytics'

export function useAnalytics() {
  return {
    isEnabled,

    trackEvent(eventName: AnalyticsEventName, params?: AnalyticsEventParams): void {
      track(eventName, params)
    },

    trackToolClick(params: ToolClickParams): void {
      track('tool_click', params)
    },

    trackCompressionFilesAdded(params: CompressionFilesAddedParams): void {
      track('compression_files_added', params)
    },

    trackCompressionBatchStarted(params: CompressionBatchParams): void {
      track('compression_batch_started', params)
    },

    trackCompressionBatchCompleted(params: CompressionBatchCompletedParams): void {
      track('compression_batch_completed', params)
    },

    trackTourStarted(params: TourStartedParams): void {
      track('tour_started', params)
    },
  }
}
