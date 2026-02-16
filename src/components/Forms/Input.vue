<template>
  <div class="relative">
    <label v-if="label" class="mb-1.5 block text-sm font-medium text-slate-700">
      {{ label }}
    </label>
    <div class="relative w-full">
      <span
        v-if="$slots.prepend"
        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      >
        <slot name="prepend" />
      </span>
      <input
        :value="modelValue"
        :placeholder="placeholder"
        :type="type"
        :disabled="disabled"
        :name="name"
        :autocomplete="autocomplete"
        :min="min"
        :max="max"
        :step="step"
        class="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm text-slate-900 outline-none transition-all placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
        :class="inputPaddingClass"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    placeholder?: string
    type?: 'text' | 'email' | 'password' | 'number' | 'search'
    disabled?: boolean
    name?: string
    autocomplete?: string
    /** Only used when type="number". */
    min?: number
    /** Only used when type="number". */
    max?: number
    /** Only used when type="number". */
    step?: number | string
  }>(),
  { type: 'text', disabled: false }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  input: [event: Event]
}>()

const slots = useSlots()
const hasPrepend = computed(() => !!slots.prepend)

const inputPaddingClass = computed(() =>
  hasPrepend.value ? 'pl-10 pr-4' : 'px-4'
)

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
  emit('input', event)
}

function onFocus(event: FocusEvent) {
  emit('focus', event)
}

function onBlur(event: FocusEvent) {
  emit('blur', event)
}
</script>
