<template>
  <aside class="flex min-h-0 w-80 shrink-0 flex-1 flex-col border-l border-slate-200 bg-white z-30 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.02)]">
    <div
      class="flex h-10 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4"
      :data-tour-guide="tourTarget(STEP_ID.SIDEBAR_CONFIG)"
    >
      <span class="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
        <span class="material-symbols-outlined text-[16px] text-slate-400">
          tune
        </span>
        Configuración
      </span>
      <button
        type="button"
        class="inline-flex size-8 shrink-0 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        aria-label="Cerrar panel"
        @click="emit('close')"
      >
        <span class="material-symbols-outlined text-[18px] leading-none">chevron_right</span>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
      <section :data-tour-guide="tourTarget(STEP_ID.SIDEBAR_WEIGHT)">
        <h2 class="text-[11px] font-bold text-slate-900 mb-3 flex items-center gap-2">
          Configuración de Peso Global
        </h2>
        <div class="space-y-4">
          <Switch :model-value="store.applySameWeightToAll"
                  label="Aplicar mismo peso a todos"
                  :disabled="store.isCompressing"
                  @update:model-value="store.setApplySameWeightToAll($event)" />
          <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 shadow-sm transition-all">
            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Peso Target Global
            </label>
            <WeightInputGroup :model-value="store.globalWeight"
                              placeholder="0.00"
                              :disabled="store.isCompressing"
                              @update:model-value="store.setGlobalWeight($event)" />
          </div>
        </div>
      </section>

      <div class="h-px bg-slate-100 w-full" />

      <section :data-tour-guide="tourTarget(STEP_ID.SIDEBAR_BREAKDOWN)">
        <h2 class="text-[11px] font-bold text-slate-900 mb-3">
          Resumen de Lote
        </h2>
        <BreakdownList :items="breakdownItems" />
      </section>
    </div>

    <div
      class="shrink-0 border-t border-slate-200 bg-slate-50/30 p-4"
      :data-tour-guide="tourTarget(STEP_ID.SIDEBAR_ACTIONS)"
    >
      <div class="grid gap-3">
        <Button
          variant="primary"
          size="xs"
          block
          :disabled="store.isCompressing || store.files.length === 0"
          @click="emit('compress')"
        >
          <template #icon>
            <span class="material-symbols-outlined text-[16px]">compress</span>
          </template>
          {{ store.isCompressing ? 'Comprimiendo…' : 'Comprimir Lote' }}
        </Button>
        <Button
          variant="secondary"
          size="xs"
          block
          :disabled="store.isCompressing"
          @click="store.reset()"
        >
          Restablecer
        </Button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { STEP_ID, tourTarget } from '../../composables/useCompressionTour'
import { useCompressionSettingsStore } from '../../stores/compressionSettings'
import { fileWeightUtils } from '../../lib/file-weight-utils'
import Button from '../ui/Button.vue'
import WeightInputGroup from '../Forms/WeightInputGroup.vue'
import Switch from '../Forms/Switch.vue'
import BreakdownList from '../list/BreakdownList.vue'

const store = useCompressionSettingsStore()

const emit = defineEmits<{
  close: []
  compress: []
}>()

const breakdownItems = computed<{ label: string; value: string; warning?: string }[]>(() => {
  const count = store.files.length
  const totalBytes = store.totalOriginalBytes
  const estimatedBytes = store.estimatedTotalBytes
  const estimatedAboveOriginal = totalBytes > 0 && estimatedBytes > totalBytes
  return [
    { label: 'Archivos', value: String(count) },
    { label: 'Peso Original', value: totalBytes ? fileWeightUtils.formatBytes(totalBytes) : '—' },
    {
      label: 'Estimado Final',
      value: estimatedBytes ? `~${fileWeightUtils.formatBytes(estimatedBytes)}` : '—',
      ...(estimatedAboveOriginal && {
        warning:
          'El peso total no se incrementa; los archivos cuyo peso deseado supera su tamaño original no se comprimirán.',
      }),
    },
  ]
})
</script>
