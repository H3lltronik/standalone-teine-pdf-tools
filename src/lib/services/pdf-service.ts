import type { CompressionFileItem, FileSource } from '../../components/types/compression'
import { FileSourceType } from '../../components/types/compression'
import type { PdfFile } from '../../core/types'
import { ArrayBufferFetcher } from '../array-buffer-fetcher'
import { PREVIEW_MAX_WIDTH } from '../constants'
import { PDFReader } from '../../implementations/pdf-reader'
import { objectUrlManager } from '../object-manager'

const pdfReader = new PDFReader()

const THUMBNAIL_SCALE = 0.1

export const pdfService = {
  async generatePreviewBlob(source: FileSource): Promise<Blob | null> {
    let pdf: PdfFile | null = null
    try {
      const arrayBuffer = await ArrayBufferFetcher.fromFileSource(source)
      pdf = await pdfReader.load(arrayBuffer, { keepBufferCopy: false })
      const pages = await pdf.getPages()
      const firstPage = pages[0]
      if (!firstPage) return null
      const imageFile = await firstPage.render(THUMBNAIL_SCALE, { maxWidth: PREVIEW_MAX_WIDTH })
      return new Blob([imageFile.data], { type: imageFile.mimeType })
    } catch {
      return null
    } finally {
      pdf?.destroy?.()
    }
  },

  async generatePreviewUrl(source: FileSource): Promise<string | null> {
    const blob = await this.generatePreviewBlob(source)
    if (!blob) return null
    return objectUrlManager.create(blob)
  },

  /**
   * Generates object URLs for thumbnail images of each page (for workspace page strip).
   * Caller must revoke URLs when no longer needed (e.g. on workspace/tab change or remove).
   */
  async generatePageThumbnailUrls(source: FileSource, numPages: number): Promise<(string | null)[]> {
    const result: (string | null)[] = []
    let pdf: PdfFile | null = null
    try {
      const arrayBuffer = await ArrayBufferFetcher.fromFileSource(source)
      pdf = await pdfReader.load(arrayBuffer, { keepBufferCopy: false })
      const pages = await pdf.getPages()
      for (let i = 0; i < numPages && i < pages.length; i++) {
        const page = pages[i]
        if (!page) {
          result.push(null)
          continue
        }
        const imageFile = await page.render(THUMBNAIL_SCALE, { maxWidth: PREVIEW_MAX_WIDTH })
        const blob = new Blob([imageFile.data], { type: imageFile.mimeType })
        result.push(objectUrlManager.create(blob))
      }
      return result
    } catch {
      return result
    } finally {
      pdf?.destroy?.()
    }
  },

  revokePreviewUrl(url: string): void {
    objectUrlManager.revoke(url)
  },

  cleanFileResources(item: CompressionFileItem): void {
    if (item.previewUrl) {
      objectUrlManager.revoke(item.previewUrl)
    }
    if (item.source.type === FileSourceType.Local) {
      objectUrlManager.revoke(item.source.objectUrl)
    }
  },
}
