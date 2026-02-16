import { jsPDF } from 'jspdf'
import type { ImageFile, IPdfWriter, PdfBuilder, PdfFile } from '../core/types'
import { PDFDocument } from './pdf-reader'

export class PDFWriter implements IPdfWriter {
  create(): PdfBuilder {
    return new PDFBuilder()
  }
}

export class PDFBuilder implements PdfBuilder {
  private doc: InstanceType<typeof jsPDF> | null = null

  async addPage(image: ImageFile): Promise<void> {
    const hasDimensions = image.width != null && image.height != null

    if (this.doc == null) {
      this.doc = hasDimensions
        ? new jsPDF({ orientation: 'p', unit: 'pt', format: [image.width!, image.height!] })
        : new jsPDF({ orientation: 'p', unit: 'pt' })
    } else {
      if (hasDimensions) {
        this.doc.addPage([image.width!, image.height!], 'p')
      } else {
        this.doc.addPage()
      }
    }

    const pageW = image.width ?? this.doc.internal.pageSize.getWidth()
    const pageH = image.height ?? this.doc.internal.pageSize.getHeight()

    const uint8Array = new Uint8Array(image.data)
    const base64 = this.uint8ArrayToBase64(uint8Array)
    const dataUrl = `data:${image.mimeType};base64,${base64}`

    const format = this.getFormatFromMimeType(image.mimeType)
    this.doc.addImage(dataUrl, format, 0, 0, pageW, pageH)
  }

  async output(): Promise<PdfFile> {
    if (this.doc == null) {
      this.doc = new jsPDF({ orientation: 'p', unit: 'pt' })
    }
    const buffer = this.doc.output('arraybuffer')
    return PDFDocument.fromBytes(buffer)
  }

  private getFormatFromMimeType(mimeType: string): string {
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'JPEG';
    if (mimeType.includes('png')) return 'PNG';
    if (mimeType.includes('webp')) return 'WEBP';
    return 'JPEG';
  }

  /**
   * Converts Uint8Array to base64 in chunks to avoid "Maximum call stack size exceeded"
   * when the array is large (spreading millions of args to String.fromCharCode blows the stack).
   */
  private uint8ArrayToBase64(bytes: Uint8Array): string {
    const CHUNK_SIZE = 8192
    let binary = ''
    for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
      const chunk = bytes.subarray(i, Math.min(i + CHUNK_SIZE, bytes.length))
      binary += String.fromCharCode.apply(null, Array.from(chunk))
    }
    return btoa(binary)
  }
}