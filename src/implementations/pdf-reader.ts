import * as pdfjsLib from 'pdfjs-dist'
import type { ImageFile, IPdfReader, PdfFile, PdfPage, PdfRenderOptions } from '../core/types'

const DEFAULT_JPEG_QUALITY = 0.9

export class PDFReader implements IPdfReader {
  async load(data: ArrayBuffer, options?: { keepBufferCopy?: boolean }): Promise<PdfFile> {
    const keepCopy = options?.keepBufferCopy !== false
    const buffer = keepCopy ? data.slice(0) : data
    const pdf = await pdfjsLib.getDocument({ data }).promise
    return new PDFDocument(buffer, pdf)
  }
}

/**
 * Single class for any PDF in memory: from reader (has pages) or from writer/compressor (bytes only).
 */
export class PDFDocument implements PdfFile {
  constructor(
    private readonly buffer: ArrayBuffer,
    private readonly pdf?: pdfjsLib.PDFDocumentProxy
  ) {}

  /** Build a PDF that is only bytes (no pages). Use for writer/compressor output. */
  static fromBytes(buffer: ArrayBuffer): PdfFile {
    return new PDFDocument(buffer)
  }

  getArrayBuffer(): ArrayBuffer {
    return this.buffer
  }

  destroy(): void {
    this.pdf?.destroy()
  }

  async getPages(): Promise<PdfPage[]> {
    if (!this.pdf) return []
    const pages: PdfPage[] = []
    for (let i = 1; i <= this.pdf.numPages; i++) {
      const page = await this.pdf.getPage(i)
      pages.push(new PDFPage(page))
    }
    return pages
  }
}

export class PDFPage implements PdfPage {
    private static canvasPool: HTMLCanvasElement[] = [];
    private static maxPoolSize = 3;
  
    constructor(private readonly page: pdfjsLib.PDFPageProxy) {}
  
    async render(scale: number, options?: PdfRenderOptions): Promise<ImageFile> {
      let effectiveScale = scale
      if (options?.maxWidth !== undefined || options?.maxHeight !== undefined) {
        const base = this.page.getViewport({ scale: 1 })
        const scaleW = options.maxWidth !== undefined ? options.maxWidth / base.width : Infinity
        const scaleH = options.maxHeight !== undefined ? options.maxHeight / base.height : Infinity
        effectiveScale = Math.min(scale, scaleW, scaleH)
      }
      const viewport = this.page.getViewport({ scale: effectiveScale })

      let canvas: HTMLCanvasElement
      let ctx: CanvasRenderingContext2D

      if (PDFPage.canvasPool.length > 0) {
        canvas = PDFPage.canvasPool.pop()!
        ctx = canvas.getContext('2d')!
      } else {
        canvas = document.createElement('canvas')
        ctx = canvas.getContext('2d')!
      }

      canvas.width = viewport.width
      canvas.height = viewport.height

      try {
        await this.page.render({
          canvasContext: ctx,
          viewport,
        }).promise

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, 'image/jpeg', DEFAULT_JPEG_QUALITY)
        )

        if (!blob) throw new Error('Failed to render page')

        return {
          name: 'page.jpeg',
          mimeType: 'image/jpeg',
          data: await blob.arrayBuffer(),
          width: viewport.width,
          height: viewport.height,
        }
      } finally {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (PDFPage.canvasPool.length < PDFPage.maxPoolSize) {
          PDFPage.canvasPool.push(canvas)
        }
      }
    }
  
    static cleanupPool(): void {
      PDFPage.canvasPool = [];
    }
  }