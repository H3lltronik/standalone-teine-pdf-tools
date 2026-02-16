import type {
  AnalyticsEventName,
  AnalyticsEventParams,
  MeasurementId,
} from './types'
import { loadGtag, isGtagAvailable } from './gtag-loader'

let measurementId: MeasurementId | null = null

export function initAnalytics(id: MeasurementId | undefined): Promise<void> {
  const trimmed = id?.trim()
  if (!trimmed || !trimmed.startsWith('G-')) {
    return Promise.resolve()
  }
  measurementId = trimmed
  return loadGtag(trimmed)
}

export function getMeasurementId(): MeasurementId | null {
  return measurementId
}

export function isEnabled(): boolean {
  return measurementId !== null && isGtagAvailable()
}

/**
 * Sends a page_view event (for SPA route changes).
 * GA4 config is set with send_page_view: false so we control page views manually.
 */
export function pageView(path: string, title?: string): void {
  if (!isEnabled() || !measurementId) return
  window.gtag!('event', 'page_view' as MeasurementId, {
    page_path: path,
    page_title: title ?? document.title,
  })
}

/**
 * Sends a custom GA4 event with typed name and optional params.
 */
export function trackEvent(
  eventName: AnalyticsEventName,
  params?: AnalyticsEventParams
): void {
  if (!isEnabled() || !measurementId) return
  window.gtag!('event', eventName as MeasurementId, params as Record<string, unknown>)
}
