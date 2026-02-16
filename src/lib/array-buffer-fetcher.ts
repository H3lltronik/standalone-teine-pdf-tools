import type { FileSource } from '../components/types/compression'
import { FileSourceType } from '../components/types/compression'

export class ArrayBufferFetcher {
  static async fromFileSource(source: FileSource): Promise<ArrayBuffer> {
    const url = source.type === FileSourceType.Local ? source.objectUrl : source.url
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to load PDF: ${res.statusText}`)
    return res.arrayBuffer()
  }
}
