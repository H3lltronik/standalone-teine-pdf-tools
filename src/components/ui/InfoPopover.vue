<template>
  <span class="group/info relative inline-flex">
    <span
      role="img"
      aria-label="Más información"
      class="inline-flex size-5 shrink-0 cursor-help items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 transition-colors hover:border-slate-400 hover:bg-slate-50 hover:text-slate-600"
    >
      <span class="text-[11px] font-bold leading-none">?</span>
    </span>
    <span
      class="pointer-events-none absolute z-20 w-56 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-600 shadow-lg opacity-0 transition-opacity duration-150 group-hover/info:opacity-100"
      :class="placementClasses"
    >
      <slot />
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    ariaLabel?: string
    /** 'top' = above trigger (default). 'left' = to the left of trigger (e.g. when near right edge). */
    placement?: 'top' | 'left'
  }>(),
  { ariaLabel: 'Más información', placement: 'top' }
)

const placementClasses = computed(() =>
  props.placement === 'left'
    ? 'bottom-1/2 right-full mr-1.5 translate-y-1/2'
    : 'bottom-full left-1/2 mb-1.5 -translate-x-1/2'
)
</script>
