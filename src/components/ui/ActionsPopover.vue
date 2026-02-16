<template>
  <Popover class="relative inline-block">
    <PopoverButton
      type="button"
      class="rounded-lg p-2 text-slate-400 transition-all hover:bg-white hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20"
      aria-label="Row actions"
    >
      <span class="material-symbols-outlined">more_vert</span>
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
        class="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] focus:outline-none"
      >
        <template v-for="(action, _index) in actions" :key="action.key">
          <div
            v-if="action.dividerBefore"
            class="my-1 h-px bg-slate-100"
          />
          <button
            type="button"
            class="flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors focus:outline-none focus:ring-0"
            :class="actionVariantClass(action.variant)"
            @click="onActionClick(action.key, close)"
          >
            <span
              v-if="action.icon"
              class="material-symbols-outlined text-lg"
            >
              {{ action.icon }}
            </span>
            <span>{{ action.label }}</span>
          </button>
        </template>
      </PopoverPanel>
    </Transition>
  </Popover>
</template>

<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'

export interface ActionsPopoverItem {
  key: string
  label: string
  icon?: string
  variant?: 'default' | 'danger'
  dividerBefore?: boolean
}

const props = defineProps<{
  actions: ActionsPopoverItem[]
}>()

const emit = defineEmits<{
  select: [actionKey: string]
}>()

function actionVariantClass(variant?: 'default' | 'danger'): string {
  return variant === 'danger'
    ? 'text-rose-600 hover:bg-rose-50'
    : 'text-slate-700 hover:bg-slate-50'
}

function onActionClick(actionKey: string, close: () => void): void {
  emit('select', actionKey)
  close()
}
</script>
