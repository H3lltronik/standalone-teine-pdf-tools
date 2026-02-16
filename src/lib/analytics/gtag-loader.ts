import type { Gtag, MeasurementId } from './types'

const SCRIPT_URL = 'https://www.googletagmanager.com/gtag/js'

/**
 * Loads gtag.js script and initializes GA4 with the given measurement ID.
 * Idempotent: safe to call multiple times with the same ID.
 */
export function loadGtag(measurementId: MeasurementId): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()

  return new Promise((resolve) => {
    if (window.gtag) {
      window.gtag('config', measurementId, { send_page_view: false })
      resolve()
      return
    }

    window.dataLayer = window.dataLayer ?? []
    const gtag: Gtag = (command, targetId, params) => {
      if (params !== undefined) {
        window.dataLayer?.push([command, targetId, params])
      } else {
        window.dataLayer?.push([command, targetId])
      }
    }
    window.gtag = gtag

    const script = document.createElement('script')
    script.async = true
    script.src = `${SCRIPT_URL}?id=${measurementId}`
    script.onload = () => {
      window.gtag!('js', new Date() as unknown as MeasurementId)
      window.gtag!('config', measurementId, { send_page_view: false })
      resolve()
    }
    document.head.appendChild(script)
  })
}

export function isGtagAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function'
}
