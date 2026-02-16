<template>
  <div class="space-y-4">
    <section>
      <h4 class="text-[11px] font-bold text-slate-900 mb-3 flex items-center gap-2">
        <span class="material-symbols-outlined text-[16px] text-slate-400">text_fields</span>
        Anotación de texto
      </h4>
      <Input
        :model-value="annotation.text ?? ''"
        label="Texto"
        placeholder="Escribe aquí…"
        @update:model-value="onTextChange"
      />
    </section>

    <div class="h-px bg-slate-100 w-full" />

    <section>
      <h4 class="text-[11px] font-bold text-slate-900 mb-3 flex items-center gap-2">
        <span class="material-symbols-outlined text-[16px] text-slate-400">format_paint</span>
        Estilo
      </h4>
      <div class="space-y-3">
        <Dropdown
          :model-value="resolvedStyle.fontFamily"
          label="Fuente"
          placeholder="Fuente"
          :options="fontOptions"
          @update:model-value="onFontFamilySelect"
        />
        <div class="grid grid-cols-2 gap-3">
          <Input
            :model-value="String(resolvedStyle.fontSize)"
            type="number"
            label="Tamaño (px)"
            :min="TEXT_FONT_SIZE_MIN"
            :max="TEXT_FONT_SIZE_MAX"
            @update:model-value="onNumberStyleChange(TEXT_STYLE_KEY.FONT_SIZE, $event, TEXT_FONT_SIZE_MIN, TEXT_FONT_SIZE_MAX)"
          />
          <Input
            :model-value="String(resolvedStyle.lineHeight)"
            type="number"
            label="Interlineado"
            :min="TEXT_LINE_HEIGHT_MIN"
            :max="TEXT_LINE_HEIGHT_MAX"
            :step="0.1"
            @update:model-value="onFloatStyleChange(TEXT_STYLE_KEY.LINE_HEIGHT, $event, TEXT_LINE_HEIGHT_MIN, TEXT_LINE_HEIGHT_MAX)"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <Input
            :model-value="String(resolvedStyle.letterSpacing)"
            type="number"
            label="Espaciado letras (px)"
            :min="TEXT_LETTER_SPACING_MIN"
            :max="TEXT_LETTER_SPACING_MAX"
            :step="0.5"
            @update:model-value="onFloatStyleChange(TEXT_STYLE_KEY.LETTER_SPACING, $event, TEXT_LETTER_SPACING_MIN, TEXT_LETTER_SPACING_MAX)"
          />
          <Dropdown
            :model-value="resolvedStyle.fontWeight"
            label="Peso"
            placeholder="Peso"
            :options="fontWeightOptions"
            @update:model-value="onFontWeightSelect"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <Dropdown
            :model-value="resolvedStyle.fontStyle"
            label="Estilo"
            placeholder="Estilo"
            :options="fontStyleOptions"
            @update:model-value="onFontStyleSelect"
          />
          <ColorInput
            :model-value="resolvedStyle.color"
            label="Color del texto"
            :placeholder="DEFAULT_TEXT_COLOR"
            @update:model-value="onStyleChange('color', $event)"
          />
        </div>
      </div>
    </section>

    <div class="h-px bg-slate-100 w-full" />

    <section>
      <h4 class="text-[11px] font-bold text-slate-900 mb-3 flex items-center gap-2">
        <span class="material-symbols-outlined text-[16px] text-slate-400">border_style</span>
        Borde
      </h4>
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <Input
            :model-value="String(resolvedStyle.borderWidth)"
            type="number"
            label="Grosor (px)"
            :min="TEXT_BORDER_WIDTH_MIN"
            :max="TEXT_BORDER_WIDTH_MAX"
            @update:model-value="onNumberStyleChange(TEXT_STYLE_KEY.BORDER_WIDTH, $event, TEXT_BORDER_WIDTH_MIN, TEXT_BORDER_WIDTH_MAX)"
          />
          <Dropdown
            :model-value="resolvedStyle.borderStyle"
            label="Estilo borde"
            placeholder="Estilo"
            :options="borderStyleOptions"
            @update:model-value="onBorderStyleSelect"
          />
        </div>
        <ColorInput
          :model-value="resolvedStyle.borderColor"
          label="Color borde"
          :placeholder="DEFAULT_TEXT_BORDER_COLOR"
          @update:model-value="onStyleChange('borderColor', $event)"
        />
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
        Eliminar anotación
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWorkspaceEditorAnnotationsStore } from '../../stores/workspaceEditorAnnotations'
import {
  TEXT_ANNOTATION_FONTS,
  TEXT_STYLE_KEY,
  TEXT_FONT_WEIGHT_OPTIONS,
  TEXT_FONT_STYLE_OPTIONS,
  TEXT_BORDER_STYLE_OPTIONS,
  TEXT_FONT_SIZE_MIN,
  TEXT_FONT_SIZE_MAX,
  TEXT_LINE_HEIGHT_MIN,
  TEXT_LINE_HEIGHT_MAX,
  TEXT_LETTER_SPACING_MIN,
  TEXT_LETTER_SPACING_MAX,
  TEXT_BORDER_WIDTH_MIN,
  TEXT_BORDER_WIDTH_MAX,
  DEFAULT_TEXT_COLOR,
  DEFAULT_TEXT_BORDER_COLOR,
  type PdfTextAnnotation,
  type PdfTextAnnotationStyle,
  type TextAnnotationFontWeight,
  type TextAnnotationFontStyle,
  type TextAnnotationBorderStyle,
  type TextAnnotationStyleIntegerKey,
  type TextAnnotationStyleFloatKey,
} from '../../types/workspace-editor'
import { getResolvedTextStyle } from '../../lib/services/annotations-service'
import Input from '../Forms/Input.vue'
import Dropdown from '../Forms/Dropdown.vue'
import ColorInput from '../Forms/ColorInput.vue'
import Button from '../ui/Button.vue'
import type { DropdownOption } from '../Forms/Dropdown.vue'

const props = defineProps<{
  pageIndex: number
  annotationIndex: number
  annotation: PdfTextAnnotation
}>()

const annotationsStore = useWorkspaceEditorAnnotationsStore()

const fontOptions: DropdownOption[] = TEXT_ANNOTATION_FONTS.map((f) => ({ value: f, label: f }))
const fontWeightOptions: DropdownOption[] = TEXT_FONT_WEIGHT_OPTIONS
const fontStyleOptions: DropdownOption[] = TEXT_FONT_STYLE_OPTIONS
const borderStyleOptions: DropdownOption[] = TEXT_BORDER_STYLE_OPTIONS

const resolvedStyle = computed(() => getResolvedTextStyle(props.annotation))

function mergeStyle(updates: Partial<PdfTextAnnotationStyle>): PdfTextAnnotationStyle {
  return { ...props.annotation.style, ...updates }
}

function onStyleChange<K extends keyof PdfTextAnnotationStyle>(
  key: K,
  value: PdfTextAnnotationStyle[K]
): void {
  if (value == null) return
  annotationsStore.updateAnnotation(props.pageIndex, props.annotationIndex, {
    style: mergeStyle({ [key]: value }),
  })
}

function onFontFamilySelect(v: string | number | null): void {
  if (v != null) onStyleChange('fontFamily', v as string)
}

function onFontWeightSelect(v: string | number | null): void {
  if (v != null) onStyleChange('fontWeight', v as TextAnnotationFontWeight)
}

function onFontStyleSelect(v: string | number | null): void {
  if (v != null) onStyleChange('fontStyle', v as TextAnnotationFontStyle)
}

function onBorderStyleSelect(v: string | number | null): void {
  if (v != null) onStyleChange('borderStyle', v as TextAnnotationBorderStyle)
}

function onNumberStyleChange(
  key: TextAnnotationStyleIntegerKey,
  raw: string,
  min: number,
  max: number
): void {
  const v = parseInt(raw, 10)
  if (!Number.isNaN(v)) onStyleChange(key, Math.max(min, Math.min(max, v)) as never)
}

function onFloatStyleChange(
  key: TextAnnotationStyleFloatKey,
  raw: string,
  min: number,
  max: number
): void {
  const v = parseFloat(raw)
  if (!Number.isNaN(v)) onStyleChange(key, Math.max(min, Math.min(max, v)) as never)
}

function onTextChange(value: string): void {
  annotationsStore.updateAnnotation(props.pageIndex, props.annotationIndex, {
    text: value.trim() || undefined,
  })
}

function onDelete(): void {
  annotationsStore.removeAnnotation(props.pageIndex, props.annotationIndex)
}
</script>
