import type { CompressionFileItem, TargetWeight } from '../components/types/compression'
import { FileSourceType } from '../components/types/compression'
import { fileWeightUtils } from './file-weight-utils'
import { objectUrlManager } from './object-manager'

export function createCompressionFileItem(
  file: File,
  targetWeight: TargetWeight
): CompressionFileItem {
  const objectUrl = objectUrlManager.create(file)
  const weight = { ...targetWeight }
  const item: CompressionFileItem = {
    id: crypto.randomUUID(),
    name: file.name,
    sizeBytes: file.size,
    targetWeight: weight,
    source: { type: FileSourceType.Local, objectUrl },
    previewLoading: true,
  }
  item.reductionPercent = fileWeightUtils.computeReductionPercent(file.size, weight)
  return item
}
