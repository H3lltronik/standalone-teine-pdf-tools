<template>
  <Listbox
    :model-value="selectedOption"
    :by="byComparator"
    :disabled="disabled"
    @update:model-value="onSelect"
    v-slot="{ open }"
  >
    <div class="relative">
      <ListboxLabel v-if="label" class="mb-1.5 block text-sm font-medium text-slate-700">
        {{ label }}
      </ListboxLabel>
      <ListboxButton
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
      </ListboxButton>
      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="scale-95 opacity-0"
        enter-to-class="scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-out"
        leave-from-class="scale-100 opacity-100"
        leave-to-class="scale-95 opacity-0"
      >
        <ListboxOptions
          class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg focus:outline-none"
        >
          <ListboxOption
            v-for="opt in options"
            :key="String(opt.value)"
            :value="opt"
            :disabled="opt.disabled"
            v-slot="{ active, selected }"
            as="template"
          >
            <li
              class="relative cursor-pointer select-none px-4 py-2.5 text-sm"
              :class="[
                active ? 'bg-slate-100 text-slate-900' : 'text-slate-700',
                selected ? 'bg-blue-50 font-medium text-primary' : '',
                opt.disabled ? 'cursor-not-allowed opacity-50' : '',
              ]"
            >
              <span class="block truncate">{{ opt.label }}</span>
              <span
                v-if="selected"
                class="absolute inset-y-0 right-3 flex items-center text-primary"
              >
                <span class="material-symbols-outlined text-lg">check</span>
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </Transition>
    </div>
  </Listbox>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Listbox,
  ListboxButton,
  ListboxLabel,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/vue'

export interface DropdownOption<T = string | number> {
  value: T
  label: string
  disabled?: boolean
}

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

function byComparator(a: DropdownOption, b: DropdownOption): boolean {
  return a.value === b.value
}

function onSelect(opt: DropdownOption | null) {
  emit('update:modelValue', opt?.value ?? null)
}
</script>
