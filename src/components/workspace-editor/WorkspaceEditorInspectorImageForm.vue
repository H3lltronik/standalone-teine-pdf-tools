<template>
  <div class="space-y-4">
    <section>
      <h4 class="text-[11px] font-bold text-slate-900 mb-3 flex items-center gap-2">
        <span class="material-symbols-outlined text-[16px] text-slate-400">image</span>
        Imagen
      </h4>
      <div class="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        <img
          :src="annotation.src"
          alt="Anotación"
          class="max-h-40 w-full object-contain"
        >
      </div>
      <p class="mt-2 text-[10px] text-slate-400">
        Arrastra en la página para mover; usa las esquinas para redimensionar.
      </p>
    </section>

    <section>
      <label class="mb-2 block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
        Ancho (% de página)
      </label>
      <div class="flex items-center gap-3">
        <input
          :value="widthPercent"
          type="range"
          :min="IMAGE_SIZE_PERCENT_MIN"
          :max="IMAGE_SIZE_PERCENT_MAX"
          :step="1"
          class="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-primary"
          @input="onWidthInput"
        >
        <input
          :value="widthPercent"
          type="number"
          :min="IMAGE_SIZE_PERCENT_MIN"
          :max="IMAGE_SIZE_PERCENT_MAX"
          class="w-14 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center text-sm text-slate-800"
          @input="onWidthNumberInput"
        >
      </div>
    </section>

    <section>
      <label class="mb-2 block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
        Alto (% de página)
      </label>
      <div class="flex items-center gap-3">
        <input
          :value="heightPercent"
          type="range"
          :min="IMAGE_SIZE_PERCENT_MIN"
          :max="IMAGE_SIZE_PERCENT_MAX"
          :step="1"
          class="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-primary"
          @input="onHeightInput"
        >
        <input
          :value="heightPercent"
          type="number"
          :min="IMAGE_SIZE_PERCENT_MIN"
          :max="IMAGE_SIZE_PERCENT_MAX"
          class="w-14 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center text-sm text-slate-800"
          @input="onHeightNumberInput"
        >
      </div>
    </section>

    <div class="h-px bg-slate-100 w-full" />

    <div class="flex flex-col gap-2">
      <Button
        variant="ghost"
        size="xs"
        class="text-red-600 hover:bg-red-50 hover:text-red-700"
        @click="onDelete"
      >
        <template #icon>
          <span class="material-symbols-outlined text-[16px]">delete</span>
        </template>
        Eliminar imagen
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWorkspaceEditorAnnotationsStore } from '../../stores/workspaceEditorAnnotations'
import type { PdfImageAnnotation } from '../../types/workspace-editor'
import Button from '../ui/Button.vue'

const IMAGE_SIZE_PERCENT_MIN = 5
const IMAGE_SIZE_PERCENT_MAX = 100

const props = defineProps<{
  pageIndex: number
  annotationIndex: number
  annotation: PdfImageAnnotation
}>()

const annotationsStore = useWorkspaceEditorAnnotationsStore()

const widthPercent = computed(() => Math.round(props.annotation.width * 100))
const heightPercent = computed(() => Math.round(props.annotation.height * 100))

function clampPercent(value: number): number {
  return Math.max(IMAGE_SIZE_PERCENT_MIN, Math.min(IMAGE_SIZE_PERCENT_MAX, value))
}

function onWidthInput(e: Event): void {
  const val = (e.target as HTMLInputElement).valueAsNumber
  if (Number.isFinite(val)) {
    const norm = clampPercent(val) / 100
    annotationsStore.updateAnnotation(props.pageIndex, props.annotationIndex, { width: norm })
  }
}

function onWidthNumberInput(e: Event): void {
  const val = Number((e.target as HTMLInputElement).value)
  if (Number.isFinite(val)) {
    const norm = clampPercent(val) / 100
    annotationsStore.updateAnnotation(props.pageIndex, props.annotationIndex, { width: norm })
  }
}

function onHeightInput(e: Event): void {
  const val = (e.target as HTMLInputElement).valueAsNumber
  if (Number.isFinite(val)) {
    const norm = clampPercent(val) / 100
    annotationsStore.updateAnnotation(props.pageIndex, props.annotationIndex, { height: norm })
  }
}

function onHeightNumberInput(e: Event): void {
  const val = Number((e.target as HTMLInputElement).value)
  if (Number.isFinite(val)) {
    const norm = clampPercent(val) / 100
    annotationsStore.updateAnnotation(props.pageIndex, props.annotationIndex, { height: norm })
  }
}

function onDelete(): void {
  annotationsStore.removeAnnotation(props.pageIndex, props.annotationIndex)
}
</script>
