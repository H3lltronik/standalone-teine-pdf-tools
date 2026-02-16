<template>
  <UiDialog :open="open" @close="onClose">
    <template #title>
      Añadir página
    </template>
    <template #description>
      Elige el tamaño de la nueva página.
    </template>

    <div class="space-y-4">
      <fieldset class="space-y-2">
        <legend class="sr-only">
          Tamaño de página
        </legend>
        <label
          v-for="opt in sizeOptions"
          :key="opt.value"
          class="flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors"
          :class="
            selectedPreset === opt.value
              ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
              : 'border-slate-200 hover:border-slate-300'
          "
        >
          <input
            v-model="selectedPreset"
            type="radio"
            :value="opt.value"
            name="page-size"
            class="h-4 w-4 border-slate-300 text-primary focus:ring-primary"
          >
          <span class="flex flex-1 flex-col items-start gap-0.5">
            <span class="text-sm font-medium text-slate-800">{{ opt.label }}</span>
            <span
              v-if="opt.detail"
              class="text-xs text-slate-500"
            >
              {{ opt.detail }}
            </span>
          </span>
        </label>
      </fieldset>

      <div
        v-if="selectedPreset === 'custom'"
        class="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4"
      >
        <FormsInput
          v-model="customWidth"
          type="number"
          label="Ancho (mm)"
          :min="1"
          :max="9999"
          step="1"
        />
        <FormsInput
          v-model="customHeight"
          type="number"
          label="Alto (mm)"
          :min="1"
          :max="9999"
          step="1"
        />
      </div>
    </div>

    <template #actions>
      <div class="flex flex-wrap items-center justify-end gap-3">
        <UiButton
          variant="secondary"
          size="md"
          class="min-w-[6.5rem] px-5 py-2.5"
          @click="onClose"
        >
          Cancelar
        </UiButton>
        <UiButton
          variant="primary"
          size="md"
          type="button"
          class="min-w-[6.5rem] px-5 py-2.5"
          @click="onAceptar"
        >
          <template #icon>
            <span class="material-symbols-outlined text-[20px] leading-none">check</span>
          </template>
          Aceptar
        </UiButton>
      </div>
    </template>
  </UiDialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { AddPageConfirmPayload, AddPageSizePreset } from './types'
import UiDialog from '../ui/Dialog.vue'
import UiButton from '../ui/Button.vue'
import FormsInput from '../Forms/Input.vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: [payload: AddPageConfirmPayload]
}>()

const SIZE_OPTIONS: { value: AddPageSizePreset; label: string; detail?: string }[] = [
  { value: 'carta', label: 'Carta', detail: '216 × 279 mm' },
  { value: 'oficio', label: 'Oficio', detail: '216 × 356 mm' },
  { value: 'custom', label: 'Libre' },
]

const sizeOptions = SIZE_OPTIONS
const selectedPreset = ref<AddPageSizePreset>('carta')
const customWidth = ref('210')
const customHeight = ref('297')

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      selectedPreset.value = 'carta'
      customWidth.value = '210'
      customHeight.value = '297'
    }
  }
)

function onClose(): void {
  emit('close')
}

function onAceptar(): void {
  const payload: AddPageConfirmPayload = {
    preset: selectedPreset.value,
  }
  if (selectedPreset.value === 'custom') {
    const w = Number.parseFloat(customWidth.value)
    const h = Number.parseFloat(customHeight.value)
    if (Number.isFinite(w) && Number.isFinite(h)) {
      payload.widthMm = w
      payload.heightMm = h
    }
  }
  emit('confirm', payload)
  emit('close')
}
</script>
