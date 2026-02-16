import type { AdSenseClientId } from './types'

const SCRIPT_BASE = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'

let loadPromise: Promise<void> | null = null

/**
 * Loads the AdSense script for the given client ID. Idempotent.
 * Resolves when the script is ready; use push() on window.adsbygoogle to fill slots.
 */
export function loadAdSense(clientId: AdSenseClientId): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()

  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve) => {
    const existing = document.querySelector(`script[src^="${SCRIPT_BASE}"]`)
    if (existing) {
      resolve()
      return
    }

    window.adsbygoogle = window.adsbygoogle ?? []
    const script = document.createElement('script')
    script.async = true
    script.crossOrigin = 'anonymous'
    script.src = `${SCRIPT_BASE}?client=${encodeURIComponent(clientId)}`
    script.onload = () => resolve()
    script.onerror = () => resolve()
    document.head.appendChild(script)
  })

  return loadPromise
}

export function isAdSenseConfigured(clientId: string | undefined): clientId is AdSenseClientId {
  return typeof clientId === 'string' && clientId.length > 0 && clientId.startsWith('ca-pub-')
}
