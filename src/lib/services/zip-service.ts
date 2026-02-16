import JSZip from 'jszip'
import { objectUrlManager } from '../object-manager'
import { DEFAULT_ZIP_FILENAME } from '../constants'

export interface ZipFileInput {
  name: string
  data: Blob | ArrayBuffer | Uint8Array
}

export interface CreateZipOptions {
  compressionLevel?: number
  rootName?: string
  outputType?: 'blob' | 'base64' | 'arraybuffer'
}

export const zipService = {
  async createZip(
    files: ZipFileInput[],
    options: CreateZipOptions = {}
  ): Promise<Blob | string | ArrayBuffer> {
    const {
      compressionLevel = 6,
      rootName = 'archive',
      outputType = 'blob',
    } = options

    const zip = new JSZip()

    for (const file of files) {
      const folder = zip.folder(rootName)
      folder?.file(file.name, file.data, {
        compression: 'DEFLATE',
        compressionOptions: { level: compressionLevel },
      })
    }

    const result = await zip.generateAsync({
      type: outputType,
      compression: 'DEFLATE',
      compressionOptions: { level: compressionLevel },
    })

    return result
  },

  async createDownloadUrl(
    files: ZipFileInput[],
    options: CreateZipOptions = {}
  ): Promise<string> {
    const blob = (await this.createZip(files, {
      ...options,
      outputType: 'blob',
    })) as Blob
    return objectUrlManager.create(blob)
  },

  async createZipFile(
    files: ZipFileInput[],
    options?: CreateZipOptions
  ): Promise<File> {
    const blob = (await this.createZip(files, {
      ...options,
      outputType: 'blob',
    })) as Blob
    return new File([blob], `${options?.rootName ?? 'archive'}.zip`, {
      type: 'application/zip',
    })
  },

  async downloadZip(
    files: ZipFileInput[],
    options: CreateZipOptions & { zipFileName?: string } = {}
  ): Promise<void> {
    const { zipFileName = DEFAULT_ZIP_FILENAME, ...createOptions } = options
    const url = await this.createDownloadUrl(files, {
      ...createOptions,
      rootName: createOptions.rootName ?? 'archive',
    })
    const a = document.createElement('a')
    a.href = url
    a.download = zipFileName
    a.click()
    objectUrlManager.revoke(url)
  },
}
