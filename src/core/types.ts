export interface IPdfReaderLoadOptions {
    /** When false, avoids copying the buffer (saves memory). Do not call getArrayBuffer() on the returned PdfFile. Default true. */
    keepBufferCopy?: boolean
  }

  export interface IPdfReader {
    load(data: ArrayBuffer, options?: IPdfReaderLoadOptions): Promise<PdfFile>
  }

  export interface IPdfWriter {
    create(): PdfBuilder
  }

  /** PDF in memory: from reader (readable, has pages) or from writer/compressor (bytes only). */
  export interface PdfFile {
    getPages(): Promise<PdfPage[]>
    getArrayBuffer(): ArrayBuffer
    /** Release PDF.js document/worker when done. No-op for byte-only PdfFiles. */
    destroy?(): void
  }

  export interface PdfRenderOptions {
    /** Cap render size so width/height do not exceed these (faster when compressor will downscale anyway). */
    maxWidth?: number
    maxHeight?: number
  }

  export interface PdfPage {
    render(scale: number, options?: PdfRenderOptions): Promise<ImageFile>
  }

  export interface PdfBuilder {
    addPage(image: ImageFile): Promise<void>
    output(): Promise<PdfFile>
  }
  
  export interface ImageFile {
    name: string
    mimeType: string
    data: ArrayBuffer
    width?: number
    height?: number
  }
  
  export interface IImageCompressor {
    compress(images: ImageFile[], options: ImageCompressionOptions, onProgress?: (p: number) => void): Promise<ImageFile[]>
  }
  
  export interface IPdfCompressor {
    compress(buffer: ArrayBuffer, options: PdfCompressionOptions, onProgress?: (p: number) => void): Promise<PdfFile>
  }
  
  export interface ImageCompressionOptions {
    maxSizeMB: number
    quality: number
    maxWidth?: number
    maxHeight?: number
  }
  
  export type PdfCompressionPreset = 'lossless' | 'balanced' | 'max'

  export interface PdfCompressionOptions {
    jpegQuality: number
    targetDPI: number
    preserveMetadata?: boolean
    /** Preset for final PDF pass; if not set, derived from other options. */
    preset?: PdfCompressionPreset
  }
  