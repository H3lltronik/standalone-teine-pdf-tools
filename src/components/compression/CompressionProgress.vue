<template>
  <TransitionRoot
    :show="store.progress !== null"
    as="template"
    enter="duration-300 ease-out"
    enter-from="opacity-0 -translate-y-full"
    enter-to="opacity-100 translate-y-0"
    leave="duration-200 ease-in"
    leave-from="opacity-100 translate-y-0"
    leave-to="opacity-0 -translate-y-full"
  >
    <div
      class="fixed left-4 right-4 z-50 top-20 md:left-1/2 md:right-auto md:-translate-x-1/2 md:max-w-xl rounded-xl bg-white border border-slate-200 shadow-lg overflow-hidden"
      role="status"
      aria-live="polite"
      :aria-label="statusText"
    >
      <div class="px-4 py-3 flex items-center gap-3">
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-slate-900 truncate">
            {{ statusText }}
          </p>
          <div class="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              class="h-full bg-primary rounded-full transition-[width] duration-300 ease-out"
              :style="{ width: `${progressPercent}%` }"
            />
          </div>
        </div>
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-90"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-90"
        >
          <button
            v-if="!store.isCompressing && store.progress !== null"
            type="button"
            class="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Cerrar"
            @click="store.clearProgress()"
          >
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </Transition>
      </div>
    </div>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TransitionRoot } from '@headlessui/vue'
import { Transition } from 'vue'
import { useCompressionSettingsStore } from '../../stores/compressionSettings'

const store = useCompressionSettingsStore()

const progressPercent = computed(() => {
  const p = store.progress
  if (!p || p.total === 0) return 0
  return Math.min(100, Math.round((p.current / p.total) * 100))
})

const statusText = computed(() => {
  const p = store.progress
  if (!p) return ''
  if (store.isCompressing) {
    return `Comprimiendo ${p.current} de ${p.total} archivo${p.total === 1 ? '' : 's'}`
  }
  return `Completado: ${p.current} de ${p.total} archivo${p.total === 1 ? '' : 's'}`
})
</script>
