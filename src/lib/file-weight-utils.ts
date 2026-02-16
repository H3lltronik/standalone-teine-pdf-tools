import type { CompressionFileItem, TargetWeight } from '../components/types/compression'
import { WeightUnit } from '../components/types/compression'

const BYTES_PER_KB = 1024
const BYTES_PER_MB = BYTES_PER_KB * 1024
const BYTES_PER_GB = BYTES_PER_MB * 1024

function targetWeightToBytes(weight: TargetWeight): number {
  switch (weight.unit) {
    case WeightUnit.B:
      return weight.value
    case WeightUnit.KB:
      return weight.value * BYTES_PER_KB
    case WeightUnit.MB:
      return weight.value * BYTES_PER_MB
    case WeightUnit.GB:
      return weight.value * BYTES_PER_GB
    default:
      return weight.value * BYTES_PER_KB
  }
}

/**
 * Formatea bytes en la unidad más adecuada (B, KB, MB, GB) usando el sufijo del enum WeightUnit.
 */
function formatBytes(bytes: number): string {
  if (bytes < BYTES_PER_KB) {
    return `${bytes} ${WeightUnit.B}`
  }
  if (bytes < BYTES_PER_MB) {
    const kb = bytes / BYTES_PER_KB
    return `${kb % 1 === 0 ? kb : kb.toFixed(1)} ${WeightUnit.KB}`
  }
  if (bytes < BYTES_PER_GB) {
    const mb = bytes / BYTES_PER_MB
    return `${mb % 1 === 0 ? mb : mb.toFixed(1)} ${WeightUnit.MB}`
  }
  const gb = bytes / BYTES_PER_GB
  return `${gb % 1 === 0 ? gb : gb.toFixed(1)} ${WeightUnit.GB}`
}

export const fileWeightUtils = {
  targetWeightToBytes,

  formatBytes,

  /** Texto de hint "Min: X KB" / "Min: X MB" etc. usando el unit del TargetWeight. */
  minHintForWeight(tw: TargetWeight): string {
    return `Min: ${tw.value} ${tw.unit}`
  },

  computeReductionPercent(sizeBytes: number, target: TargetWeight): number {
    const targetSizeBytes = targetWeightToBytes(target)
    if (sizeBytes <= 0) return 0
    const reduction = ((targetSizeBytes - sizeBytes) / sizeBytes) * 100
    return Math.round(reduction)
  },

  totalOriginalBytes(files: CompressionFileItem[]): number {
    return files.reduce((sum, f) => sum + f.sizeBytes, 0)
  },

  estimatedTotalBytes(files: CompressionFileItem[]): number {
    return files.reduce((sum, f) => sum + targetWeightToBytes(f.targetWeight), 0)
  },
}
