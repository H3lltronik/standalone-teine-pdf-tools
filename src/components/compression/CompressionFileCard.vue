<template>
  <div
       class="bg-white rounded-xl shadow-soft border border-slate-200 overflow-hidden group hover:border-primary/30 transition-all relative flex flex-col h-full">
    <div v-if="file.loading"
         class="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/40 rounded-xl"
         aria-busy="true"
         aria-label="Comprimiendo">
      <span class="material-symbols-outlined animate-spin text-4xl text-white"
            aria-hidden>
        progress_activity
      </span>
    </div>

    <Button variant="icon"
            class="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100"
            title="Eliminar"
            :disabled="store.isCompressing"
            @click="store.removeFile(file.id)">
      <template #icon>
        <span class="material-symbols-outlined text-[16px]">delete</span>
      </template>
    </Button>

    <div
      class="h-40 relative overflow-hidden flex items-end justify-center border-b border-slate-100 transition-colors"
      :class="file.optimizationComplete ? 'bg-emerald-50' : 'bg-slate-50'">
      <div
           class="absolute top-2 right-2 z-10 flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white shadow-sm"
           v-if="file.optimizationComplete"
           aria-label="Optimización completada">
        <span class="material-symbols-outlined text-[16px]">check</span>
      </div>
      <div
           class="w-28 shadow-lg bg-white relative -bottom-2 transition-transform group-hover:-translate-y-1 duration-300 rounded-t-sm border border-slate-200">
        <PDFPreview
          :src="file.previewUrl"
          :alt="file.name"
          :loading="file.previewLoading"
        />
      </div>
    </div>

    <div class="p-4 flex flex-col flex-1">
      <div class="flex items-start justify-between mb-4">
        <div class="overflow-hidden w-full">
          <div class="flex items-center gap-2 mb-1">
            <span class="material-symbols-outlined text-rose-500 text-[18px]">
              picture_as_pdf
            </span>
            <h3 class="font-semibold text-slate-900 truncate text-xs"
                :title="file.name">
              {{ file.name }}
            </h3>
          </div>
          <div class="flex items-center gap-2 pl-6">
            <span class="text-[10px] text-slate-500 font-medium">
              {{ fileWeightUtils.formatBytes(file.sizeBytes) }}
            </span>
            <span class="h-0.5 w-0.5 rounded-full bg-slate-400"
                  aria-hidden />
            <span class="text-[9px] text-slate-500 uppercase tracking-wide">
              Original
            </span>
          </div>
        </div>
      </div>

      <div class="mt-auto space-y-2">
        <WeightInputGroup :model-value="effectiveTargetWeight"
                          label="Peso Deseado"
                          :min-hint="fileWeightUtils.minHintForWeight(file.targetWeight)"
                          :disabled="store.applySameWeightToAll || store.isCompressing"
                          @update:model-value="onTargetWeightChange" />
        <div class="flex justify-between items-center mt-1.5 px-0.5">
          <span v-if="isTargetAboveFileSize"
                class="text-[10px] text-red-600 font-bold flex items-center gap-1 bg-red-50 px-1.5 py-0.5 rounded">
            <span class="material-symbols-outlined text-[10px] stroke-2">arrow_upward</span>
            No se comprime
            <InfoPopover>
              El peso del archivo no se incrementa; este archivo no se comprimirá.
            </InfoPopover>
          </span>
          <span v-else-if="file.reductionPercent != null"
                class="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded">
            <span class="material-symbols-outlined text-[10px] stroke-2">arrow_downward</span>
            {{ file.reductionPercent }}%
          </span>
          <span v-else
                class="text-[10px] text-slate-500">—</span>
          <span v-if="store.applySameWeightToAll"
                class="text-[9px] text-slate-500 flex items-center gap-1">
            <span class="material-symbols-outlined text-[10px]">link</span>
            Sincronizado
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCompressionSettingsStore } from '../../stores/compressionSettings'
import { fileWeightUtils } from '../../lib/file-weight-utils'
import Button from '../ui/Button.vue'
import InfoPopover from '../ui/InfoPopover.vue'
import WeightInputGroup from '../Forms/WeightInputGroup.vue'
import PDFPreview from './PDFPreview.vue'
import { type CompressionFileItem, type TargetWeight } from '../types/compression'

const props = defineProps<{
  file: CompressionFileItem
}>()

const store = useCompressionSettingsStore()

const effectiveTargetWeight = computed<TargetWeight>(() =>
  store.applySameWeightToAll ? store.globalWeight : props.file.targetWeight
)

const isTargetAboveFileSize = computed(() =>
  fileWeightUtils.isTargetAboveSize(props.file.sizeBytes, effectiveTargetWeight.value)
)

function onTargetWeightChange(weight: TargetWeight) {
  store.setFileTargetWeight(props.file.id, weight)
}
</script>
