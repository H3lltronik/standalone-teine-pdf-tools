import { compress, type ProgressEvent } from '@quicktoolsone/pdf-compress'
import type { IPdfCompressor, PdfCompressionOptions, PdfFile } from '../core/types'
import { PDFDocument } from './pdf-reader'

export class PDFCompressor implements IPdfCompressor {
  async compress(
    buffer: ArrayBuffer,
    options: PdfCompressionOptions,
    onProgress?: (p: number) => void
  ): Promise<PdfFile> {
    const preset = options.preset ?? 'balanced'
    const result = await compress(buffer, {
      preset,
      jpegQuality: options.jpegQuality,
      targetDPI: options.targetDPI,
      preserveMetadata: options.preserveMetadata ?? false,
      onProgress: onProgress ? (event: ProgressEvent) => onProgress(event.progress) : undefined,
    })
    return PDFDocument.fromBytes(result.pdf)
  }
}