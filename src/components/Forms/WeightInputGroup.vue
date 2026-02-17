<template>
  <div class="relative">
    <div v-if="label || minHint" class="flex justify-between items-baseline mb-1.5">
      <label v-if="label" :for="inputId" class="text-[10px] font-bold text-slate-700 uppercase tracking-wide">
        {{ label }}
      </label>
      <span v-if="minHint" class="text-[10px] font-medium text-slate-500">{{ minHint }}</span>
    </div>
    <div
      class="flex rounded-md shadow-sm ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-primary transition-shadow"
      :class="[
        disabled ? 'opacity-60 pointer-events-none bg-slate-50' : 'bg-white',
      ]"
    >
      <input
        :id="inputId"
        :value="modelValue.value"
        type="number"
        :placeholder="placeholder"
        :disabled="disabled"
        class="weight-input-no-spinner block w-full rounded-l-md border-none py-1.5 pl-3 pr-2 text-xs focus:ring-0 font-semibold text-slate-900 bg-transparent placeholder:text-slate-300"
        :aria-label="label ?? 'Valor de peso'"
        @input="onNumberInput"
      />
      <div class="w-px bg-slate-200 my-1" aria-hidden="true" />
      <select
        :id="selectId"
        :value="modelValue.unit"
        :disabled="disabled"
        class="rounded-r-md border-none bg-slate-50 py-1.5 pl-2 pr-7 text-[10px] font-semibold text-slate-600 focus:ring-0 cursor-pointer hover:bg-slate-100 transition-colors"
        aria-label="Unidad de peso (MB o KB)"
        @change="onUnitChange"
      >
        <option :value="WeightUnit.MB">MB</option>
        <option :value="WeightUnit.KB">KB</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type TargetWeight, WeightUnit } from '../types/compression'

const instanceId = Math.random().toString(36).slice(2, 11)
const inputId = `weight-input-${instanceId}`
const selectId = `weight-unit-${instanceId}`

const props = withDefaults(
  defineProps<{
    modelValue: TargetWeight
    label?: string
    minHint?: string
    placeholder?: string
    disabled?: boolean
  }>(),
  { placeholder: '0.00', disabled: false }
)

const emit = defineEmits<{
  'update:modelValue': [value: TargetWeight]
}>()

function onNumberInput(event: Event) {
  const target = event.target as HTMLInputElement
  const value = target.value === '' ? 0 : Number.parseFloat(target.value)
  const num = Number.isNaN(value) ? 0 : value
  emit('update:modelValue', { ...props.modelValue, value: num })
}

function onUnitChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const unit =
    target.value === WeightUnit.MB ? WeightUnit.MB : WeightUnit.KB
  emit('update:modelValue', { ...props.modelValue, unit })
}
</script>

<style scoped>
.weight-input-no-spinner::-webkit-inner-spin-button,
.weight-input-no-spinner::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
