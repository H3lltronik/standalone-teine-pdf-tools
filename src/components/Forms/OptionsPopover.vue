<template>
  <Popover v-slot="{ open }" class="relative">
    <label v-if="label" class="mb-1.5 block text-sm font-medium text-slate-700">
      {{ label }}
    </label>
    <PopoverButton
      :disabled="disabled"
      class="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-left text-sm font-medium text-slate-600 outline-none transition-all hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60 focus:border-primary focus:ring-2 focus:ring-primary/20"
      :class="[open ? 'border-primary ring-2 ring-primary/20' : '']"
    >
      <span class="truncate">
        {{ selectedOption ? selectedOption.label : placeholder }}
      </span>
      <span
        class="material-symbols-outlined text-lg transition-transform"
        :class="open ? 'rotate-180' : ''"
      >
        expand_more
      </span>
    </PopoverButton>
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="scale-95 opacity-0"
      enter-to-class="scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-out"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-95 opacity-0"
    >
      <PopoverPanel
        v-slot="{ close }"
        class="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] focus:outline-none"
      >
        <button
          v-for="opt in options"
          :key="String(opt.value)"
          type="button"
          class="relative flex w-full cursor-pointer select-none items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-50 focus:bg-slate-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          :class="[
            isSelected(opt) ? 'bg-blue-50 font-medium text-primary' : 'text-slate-700',
          ]"
          :disabled="opt.disabled"
          @click="onSelectOption(opt, close)"
        >
          <span class="block truncate">{{ opt.label }}</span>
          <span
            v-if="isSelected(opt)"
            class="text-primary"
          >
            <span class="material-symbols-outlined text-lg">check</span>
          </span>
        </button>
      </PopoverPanel>
    </Transition>
  </Popover>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import type { DropdownOption } from './Dropdown.vue'

const props = withDefaults(
  defineProps<{
    modelValue: DropdownOption['value'] | null
    options: DropdownOption[]
    label?: string
    placeholder?: string
    disabled?: boolean
  }>(),
  { placeholder: 'Select...', disabled: false }
)

const emit = defineEmits<{
  'update:modelValue': [value: DropdownOption['value'] | null]
}>()

const selectedOption = computed(() =>
  props.options.find((o) => o.value === props.modelValue) ?? null
)

function isSelected(opt: DropdownOption): boolean {
  return opt.value === props.modelValue
}

function onSelectOption(opt: DropdownOption, close: () => void): void {
  if (opt.disabled) return
  emit('update:modelValue', opt.value)
  close()
}
</script>
