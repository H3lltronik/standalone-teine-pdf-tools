/**
 * Google AdSense types.
 * Client ID format: ca-pub-XXXXXXXXXXXXXXXX
 * Slot ID: numeric string from AdSense ad unit.
 */

export type AdSenseClientId = string
export type AdSenseSlotId = string

export type AdFormat = 'auto' | 'rectangle' | 'horizontal' | 'vertical'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}
