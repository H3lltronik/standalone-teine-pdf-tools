import { defineStore } from 'pinia'
import {
  type CompressionFileItem,
  type TargetWeight,
  FileSourceType,
} from '../components/types/compression'
import { createCompressionFileItem } from '../lib/compression-file-item-factory'
import { DEFAULT_GLOBAL_WEIGHT } from '../lib/constants'
import { fileWeightUtils } from '../lib/file-weight-utils'
import { PromisePool } from '../lib/promise-pool'
import { pdfService } from '../lib/services/pdf-service'

/** Max PDFs loaded at once for thumbnail generation. Prevents GB-scale RAM when adding many files. */
const PREVIEW_CONCURRENCY = 3

export const useCompressionSettingsStore = defineStore('compressionSettings', {
  state: () => ({
    applySameWeightToAll: true,
    globalWeight: { ...DEFAULT_GLOBAL_WEIGHT } as TargetWeight,
    files: [] as CompressionFileItem[],
    /** Global batch compression in progress; blocks add/reset/inputs. */
    isCompressing: false,
    /** Batch progress: current completed count and total. Null when no run or after user dismisses. */
    progress: null as { current: number; total: number } | null,
    /** Error message when batch was cancelled due to failure; cleared when user dismisses or on next run. */
    batchError: null as string | null,
  }),

  getters: {
    fileById(): (id: string) => CompressionFileItem | undefined {
      return (id: string) => this.files.find((f) => f.id === id)
    },

    totalOriginalBytes(): number {
      return fileWeightUtils.totalOriginalBytes(this.files)
    },

    estimatedTotalBytes(): number {
      return fileWeightUtils.estimatedTotalBytes(this.files)
    },
  },

  actions: {
    setApplySameWeightToAll(value: boolean) {
      this.applySameWeightToAll = value
      if (value) {
        this.syncGlobalWeightToFiles()
      }
    },

    setGlobalWeight(weight: TargetWeight) {
      this.globalWeight = { ...weight }
      if (this.applySameWeightToAll) {
        this.syncGlobalWeightToFiles()
      }
    },

    syncGlobalWeightToFiles() {
      const weight = this.globalWeight
      for (const file of this.files) {
        file.targetWeight = { ...weight }
        file.reductionPercent = fileWeightUtils.computeReductionPercent(file.sizeBytes, weight)
      }
    },

    setFileTargetWeight(fileId: string, weight: TargetWeight) {
      const file = this.files.find((f) => f.id === fileId)
      if (!file) return
      file.targetWeight = { ...weight }
      file.reductionPercent = fileWeightUtils.computeReductionPercent(file.sizeBytes, weight)
    },

    setCompressing(value: boolean) {
      this.isCompressing = value
    },

    setProgress(current: number, total: number) {
      this.progress = { current, total }
    },

    clearProgress() {
      this.progress = null
      this.batchError = null
    },

    setBatchError(message: string | null) {
      this.batchError = message
    },

    setFileLoading(fileId: string, value: boolean) {
      const file = this.files.find((f) => f.id === fileId)
      if (file) file.loading = value
    },

    setFileOptimizedBlob(fileId: string, blob: Blob) {
      const file = this.files.find((f) => f.id === fileId)
      if (file) {
        file.optimizedBlob = blob
        file.optimizationComplete = true
      }
    },

    setFilePreviewUrl(fileId: string, url: string) {
      const file = this.files.find((f) => f.id === fileId)
      if (file) {
        file.previewUrl = url
        file.previewLoading = false
      }
    },

    clearOptimizedBlobs() {
      for (const file of this.files) {
        file.optimizedBlob = undefined
        file.optimizationComplete = false
        file.loading = false
      }
    },

    addLocalFiles(files: File[]) {
      const global = this.globalWeight
      const store = this
      const items: CompressionFileItem[] = files.map((file) =>
        createCompressionFileItem(file, global)
      )
      this.files.push(...items)
      const localItems = items.filter((i) => i.source.type === FileSourceType.Local)
      if (localItems.length === 0) return
      const pool = new PromisePool(PREVIEW_CONCURRENCY)
      void pool
        .map(localItems, async (item) => {
          const fileId = item.id
          const previewUrl = await pdfService.generatePreviewUrl(item.source)
          if (!previewUrl) return
          const stillExists = store.files.some((f) => f.id === fileId)
          if (stillExists) {
            store.setFilePreviewUrl(fileId, previewUrl)
          } else {
            pdfService.revokePreviewUrl(previewUrl)
          }
        })
        .catch(() => {})
    },

    addFiles(items: CompressionFileItem[]) {
      this.files.push(...items)
    },

    removeFile(fileId: string) {
      const index = this.files.findIndex((f) => f.id === fileId)
      if (index === -1) return
      const item = this.files[index]
      if (!item) return
      pdfService.cleanFileResources(item)
      this.files.splice(index, 1)
    },

    reset() {
      for (const item of this.files) {
        pdfService.cleanFileResources(item)
      }
      this.files = []
      this.applySameWeightToAll = true
      this.globalWeight = { ...DEFAULT_GLOBAL_WEIGHT }
      this.isCompressing = false
      this.progress = null
    },
  },
})
