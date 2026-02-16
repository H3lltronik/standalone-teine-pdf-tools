<template>
  <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
    <div class="mb-4 flex items-center gap-3">
      <div
        class="flex size-10 items-center justify-center rounded-lg"
        :class="iconContainerClass"
      >
        <span class="material-symbols-outlined">{{ icon }}</span>
      </div>
      <p class="text-[11px] font-bold uppercase tracking-widest text-slate-400">
        {{ label }}
      </p>
    </div>
    <div class="flex items-baseline gap-2">
      <h4 class="text-3xl font-bold text-slate-900">{{ value }}</h4>
      <span class="text-lg font-bold text-slate-400">{{ unit }}</span>
      <div v-if="$slots.suffix" class="ml-auto shrink-0">
        <slot name="suffix" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const VARIANT_CLASSES: Record<string, string> = {
  primary: 'bg-primary/5 text-primary',
  'save-green': 'bg-save-green/5 text-save-green',
  amber: 'bg-amber-500/5 text-amber-500',
}

const props = defineProps<{
  label: string
  value: string | number
  unit: string
  icon: string
  iconVariant?: keyof typeof VARIANT_CLASSES
}>()

const iconContainerClass = computed(() =>
  VARIANT_CLASSES[props.iconVariant ?? 'primary'] ?? VARIANT_CLASSES.primary
)
</script>
