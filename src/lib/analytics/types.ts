/**
 * Google Analytics (GA4) types.
 * Measurement ID format: G-XXXXXXXXXX
 */

export type MeasurementId = string

declare global {
  interface Window {
    gtag?: Gtag
    dataLayer?: unknown[]
  }
}

export type Gtag = (
  command: 'config' | 'event' | 'js',
  targetId: MeasurementId,
  params?: Record<string, unknown>
) => void

/** GA4 event names used by the app (strongly typed for consistency). */
export type AnalyticsEventName =
  | 'page_view'
  | 'tool_click'
  | 'compression_files_added'
  | 'compression_batch_started'
  | 'compression_batch_completed'
  | 'tour_started'

export interface ToolClickParams {
  tool: 'compression' | 'editor'
  source: 'home_card' | 'nav'
}

export interface CompressionFilesAddedParams {
  file_count: number
}

export interface CompressionBatchParams {
  file_count: number
}

export interface CompressionBatchCompletedParams extends CompressionBatchParams {
  success: boolean
}

export interface TourStartedParams {
  tour_id: string
}

export type AnalyticsEventParams =
  | ToolClickParams
  | CompressionFilesAddedParams
  | CompressionBatchParams
  | CompressionBatchCompletedParams
  | TourStartedParams
  | Record<string, unknown>
