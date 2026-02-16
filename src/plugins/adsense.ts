import type { App } from 'vue'
import { loadAdSense } from '@/lib/ads/adsense-loader'

const CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID as string | undefined

/**
 * Ensures the AdSense script is loaded when a valid client ID is set.
 * Does nothing if VITE_ADSENSE_CLIENT_ID is empty.
 */
export function createAdSensePlugin() {
  return {
    install(_app: App): void {
      if (!CLIENT_ID || !CLIENT_ID.startsWith('ca-pub-')) return
      loadAdSense(CLIENT_ID)
    },
  }
}
