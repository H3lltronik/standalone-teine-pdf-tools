import type { PdfAnnotation } from '../types/workspace-editor'
import { objectUrlManager } from './object-manager'
import { drawAnnotationsOnCanvas, type ExportViewport } from './export-annotations-canvas'

const THUMBNAIL_MAX_WIDTH = 96

/**
 * Captures a thumbnail from the rendered page canvas and annotations.
 * Returns an object URL for use as thumbnail image (caller/store must revoke when no longer needed).
 */
export async function capturePageToThumbnailUrl(
  sourceCanvas: HTMLCanvasElement,
  annotations: PdfAnnotation[],
  pageWidth: number,
  pageHeight: number,
  maxWidth: number = THUMBNAIL_MAX_WIDTH
): Promise<string | null> {
  if (pageWidth <= 0 || pageHeight <= 0) return Promise.resolve(null)
  const scale = maxWidth / pageWidth
  const thumbW = Math.round(maxWidth)
  const thumbH = Math.round(pageHeight * scale)
  if (thumbW <= 0 || thumbH <= 0) return Promise.resolve(null)

  const off = document.createElement('canvas')
  off.width = thumbW
  off.height = thumbH
  const ctx = off.getContext('2d')
  if (!ctx) return Promise.resolve(null)

  ctx.drawImage(sourceCanvas, 0, 0, pageWidth, pageHeight, 0, 0, thumbW, thumbH)
  const viewport: ExportViewport = { width: thumbW, height: thumbH, scale }
  await drawAnnotationsOnCanvas(ctx, annotations, viewport)

  return new Promise<string | null>((resolve) => {
    off.toBlob(
      (blob) => {
        if (!blob) {
          resolve(null)
          return
        }
        resolve(objectUrlManager.create(blob))
      },
      'image/png',
      0.92
    )
  })
}

/** Capture that returns a data URL (for tests or when blob async is not needed). Prefer capturePageToThumbnailUrl for thumbnails. */
export async function capturePageToDataUrl(
  sourceCanvas: HTMLCanvasElement,
  annotations: PdfAnnotation[],
  pageWidth: number,
  pageHeight: number,
  maxWidth: number = THUMBNAIL_MAX_WIDTH
): Promise<string | null> {
  if (pageWidth <= 0 || pageHeight <= 0) return null
  const scale = maxWidth / pageWidth
  const thumbW = Math.round(maxWidth)
  const thumbH = Math.round(pageHeight * scale)
  if (thumbW <= 0 || thumbH <= 0) return null

  const off = document.createElement('canvas')
  off.width = thumbW
  off.height = thumbH
  const ctx = off.getContext('2d')
  if (!ctx) return null

  ctx.drawImage(sourceCanvas, 0, 0, pageWidth, pageHeight, 0, 0, thumbW, thumbH)
  await drawAnnotationsOnCanvas(ctx, annotations, { width: thumbW, height: thumbH, scale })
  return off.toDataURL('image/png', 0.92)
}
