export enum WeightUnit {
  B = 'B',
  KB = 'KB',
  MB = 'MB',
  GB = 'GB',
}

export interface TargetWeight {
  value: number
  unit: WeightUnit
}

export enum FileSourceType {
  Local = 'local',
  Remote = 'remote',
}

export type FileSource =
  | { type: FileSourceType.Local; objectUrl: string }
  | { type: FileSourceType.Remote; url: string }

export interface CompressionFileItem {
  id: string
  name: string
  sizeBytes: number
  targetWeight: TargetWeight
  reductionPercent?: number
  source: FileSource
  /** True while this file is being optimized in the batch. */
  loading?: boolean
  /** Optimized PDF blob after batch compression (for download). */
  optimizedBlob?: Blob
  /** True when this file has been successfully optimized in the batch. */
  optimizationComplete?: boolean
  /** Object URL for first-page preview image. Revoked when file is removed. */
  previewUrl?: string
  /** True while the preview image is being generated. */
  previewLoading?: boolean
}

export interface CompressionFormOptions {
  skipImageResize: boolean
  maxSizeMB: number
  maxWidthOrHeight: number | ''
  useWebWorker: boolean
  libURL: string
  preserveExif: boolean
  maxIteration: number
  exifOrientation: number | ''
  fileType: string
  initialQuality: number
  alwaysKeepResolution: boolean
  reportProgress: boolean
}

export const defaultCompressionFormOptions: CompressionFormOptions = {
  skipImageResize: false,
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  libURL: '',
  preserveExif: false,
  maxIteration: 10,
  exifOrientation: '',
  fileType: '',
  initialQuality: 1,
  alwaysKeepResolution: false,
  reportProgress: false,
}
