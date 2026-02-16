<template>
  <div class="relative">
    <label v-if="label" class="mb-1.5 block text-sm font-medium text-slate-700">
      {{ label }}
    </label>
    <div class="flex items-center gap-2">
      <input
        :value="hexValue"
        type="color"
        class="h-9 w-12 shrink-0 cursor-pointer rounded border border-slate-200 bg-white"
        @input="onColorPickerInput"
      >
      <Input
        :model-value="modelValue"
        class="min-w-0 flex-1"
        :placeholder="placeholder"
        @update:model-value="$emit('update:modelValue', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Input from './Input.vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    placeholder?: string
  }>(),
  { placeholder: '#000000' }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

/** Normalize CSS color to hex for the native color input. */
const hexValue = computed(() => {
  const c = props.modelValue
  const rgb = c.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (rgb) {
    const r = parseInt(rgb[1] ?? '0', 10)
    const g = parseInt(rgb[2] ?? '0', 10)
    const b = parseInt(rgb[3] ?? '0', 10)
    return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')
  }
  if (/^#[0-9a-fA-F]{3,8}$/.test(c)) return c
  return '#000000'
})

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return props.modelValue
  return `rgb(${parseInt(result[1] ?? '0', 16)}, ${parseInt(result[2] ?? '0', 16)}, ${parseInt(result[3] ?? '0', 16)})`
}

function onColorPickerInput(e: Event): void {
  const hex = (e.target as HTMLInputElement).value
  emit('update:modelValue', hexToRgb(hex))
}
</script>
