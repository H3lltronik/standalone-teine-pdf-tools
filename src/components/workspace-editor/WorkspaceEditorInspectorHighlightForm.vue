<template>
  <div class="space-y-4">
    <section>
      <h4 class="text-[11px] font-bold text-slate-900 mb-3 flex items-center gap-2">
        <span class="material-symbols-outlined text-[16px] text-slate-400">highlight</span>
        Resaltado
      </h4>
      <label class="mb-2 block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
        Color
      </label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="preset in HIGHLIGHT_PRESETS"
          :key="preset.value"
          type="button"
          class="size-8 rounded-lg border-2 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          :class="currentColor === preset.value ? 'border-slate-800 scale-105' : 'border-slate-200'"
          :style="{ backgroundColor: preset.value }"
          :title="preset.label"
          :aria-label="`Color ${preset.label}`"
          @click="onColorChange(preset.value)"
        />
      </div>
      <div class="mt-2 flex items-center gap-2">
        <input
          :value="hexColor"
          type="color"
          class="h-8 w-12 cursor-pointer rounded border border-slate-200 bg-white"
          @input="onColorPickerInput($event)"
        >
        <span class="text-xs text-slate-500">Personalizado</span>
      </div>
    </section>

    <section>
      <label class="mb-2 block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
        Grosor del pincel (px)
      </label>
      <div class="flex items-center gap-3">
        <input
          v-model.number="brushHeightLocal"
          type="range"
          :min="MIN_BRUSH_HEIGHT"
          :max="MAX_BRUSH_HEIGHT"
          :step="2"
          class="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-primary"
          @input="onBrushHeightInput"
        >
        <input
          :value="brushHeightLocal"
          type="number"
          :min="MIN_BRUSH_HEIGHT"
          :max="MAX_BRUSH_HEIGHT"
          class="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center text-sm text-slate-800"
          @input="onBrushHeightNumberInput"
        >
      </div>
      <p class="mt-1 text-[10px] text-slate-400">
        {{ MIN_BRUSH_HEIGHT }} – {{ MAX_BRUSH_HEIGHT }} px
      </p>
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
        Eliminar resaltado
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useWorkspaceEditorAnnotationsStore } from '../../stores/workspaceEditorAnnotations'
import {
  DEFAULT_HIGHLIGHT_COLOR,
  DEFAULT_HIGHLIGHT_BRUSH_HEIGHT,
  type PdfHighlightAnnotation,
} from '../../types/workspace-editor'
import Button from '../ui/Button.vue'

const MIN_BRUSH_HEIGHT = 8
const MAX_BRUSH_HEIGHT = 80

const HIGHLIGHT_PRESETS = [
  { label: 'Amarillo', value: 'rgba(255, 235, 59, 0.4)' },
  { label: 'Verde', value: 'rgba(129, 199, 132, 0.5)' },
  { label: 'Rosa', value: 'rgba(244, 143, 177, 0.5)' },
  { label: 'Azul', value: 'rgba(100, 181, 246, 0.5)' },
] as const

const props = defineProps<{
  pageIndex: number
  annotationIndex: number
  annotation: PdfHighlightAnnotation
}>()

const annotationsStore = useWorkspaceEditorAnnotationsStore()

const currentColor = computed(() => props.annotation.color ?? DEFAULT_HIGHLIGHT_COLOR)

const brushHeightLocal = ref(
  Math.max(MIN_BRUSH_HEIGHT, Math.min(MAX_BRUSH_HEIGHT, props.annotation.brushHeight ?? DEFAULT_HIGHLIGHT_BRUSH_HEIGHT))
)

watch(
  () => props.annotation.brushHeight,
  (v) => {
    const n = v ?? DEFAULT_HIGHLIGHT_BRUSH_HEIGHT
    brushHeightLocal.value = Math.max(MIN_BRUSH_HEIGHT, Math.min(MAX_BRUSH_HEIGHT, n))
  }
)

watch(
  () => props.annotationIndex,
  () => {
    brushHeightLocal.value = Math.max(
      MIN_BRUSH_HEIGHT,
      Math.min(MAX_BRUSH_HEIGHT, props.annotation.brushHeight ?? DEFAULT_HIGHLIGHT_BRUSH_HEIGHT)
    )
  }
)

function onBrushHeightInput(e: Event): void {
  const val = (e.target as HTMLInputElement).valueAsNumber
  if (Number.isFinite(val)) {
    const clamped = Math.max(MIN_BRUSH_HEIGHT, Math.min(MAX_BRUSH_HEIGHT, val))
    brushHeightLocal.value = clamped
    annotationsStore.updateAnnotation(props.pageIndex, props.annotationIndex, { brushHeight: clamped })
  }
}

function onBrushHeightNumberInput(e: Event): void {
  const val = Number((e.target as HTMLInputElement).value)
  if (Number.isFinite(val)) {
    const clamped = Math.max(MIN_BRUSH_HEIGHT, Math.min(MAX_BRUSH_HEIGHT, val))
    brushHeightLocal.value = clamped
    annotationsStore.updateAnnotation(props.pageIndex, props.annotationIndex, { brushHeight: clamped })
  }
}

/** Hex for native color input (e.g. #ffeb3b). */
const hexColor = computed(() => {
  const rgba = currentColor.value
  const m = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!m) return '#ffeb3b'
  const r = parseInt(m[1] ?? '0', 10)
  const g = parseInt(m[2] ?? '0', 10)
  const b = parseInt(m[3] ?? '0', 10)
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')
})

function onColorChange(value: string): void {
  annotationsStore.updateAnnotation(props.pageIndex, props.annotationIndex, { color: value })
}

function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return DEFAULT_HIGHLIGHT_COLOR
  const r = parseInt(result[1] ?? '0', 16)
  const g = parseInt(result[2] ?? '0', 16)
  const b = parseInt(result[3] ?? '0', 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function onColorPickerInput(event: Event): void {
  const input = event.target as HTMLInputElement
  const hex = input.value
  annotationsStore.updateAnnotation(props.pageIndex, props.annotationIndex, {
    color: hexToRgba(hex, 0.4),
  })
}

function onDelete(): void {
  annotationsStore.removeAnnotation(props.pageIndex, props.annotationIndex)
}
</script>
