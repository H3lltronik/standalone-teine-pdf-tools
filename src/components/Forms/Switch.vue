<template>
  <SwitchGroup as="div" class="flex items-center justify-between gap-3">
    <SwitchLabel
      v-if="label"
      class="text-xs text-slate-600 font-medium cursor-pointer"
    >
      {{ label }}
    </SwitchLabel>
    <Switch
      :model-value="modelValue"
      :disabled="disabled"
      as="template"
      v-slot="{ checked }"
      @update:model-value="emit('update:modelValue', $event)"
    >
      <button
        type="button"
        class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        :class="checked ? 'bg-primary' : 'bg-slate-200'"
      >
        <span class="sr-only">{{ label ?? 'Toggle' }}</span>
        <span
          class="pointer-events-none inline-block h-4 w-4 shrink-0 rounded-full bg-white shadow ring-0 transition"
          :class="checked ? 'translate-x-4' : 'translate-x-0.5'"
          aria-hidden
        />
      </button>
    </Switch>
    <slot v-if="$slots.default" name="default" />
  </SwitchGroup>
</template>

<script setup lang="ts">
import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue'

defineProps<{
  modelValue: boolean
  label?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>
