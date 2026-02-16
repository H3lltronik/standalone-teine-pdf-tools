<template>
  <button
    type="button"
    class="compression-tab fixed right-0 top-24 z-30 flex items-center gap-2 rounded-l-xl border border-r-0 border-primary/30 bg-white py-3 pl-3 pr-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12)] transition-colors hover:border-primary/50 hover:bg-primary/5"
    :aria-label="ariaLabel"
    @click="emit('click')"
  >
    <span class="relative flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <span class="material-symbols-outlined text-[20px] leading-none">compress</span>
      <span
        class="compression-tab__pulse absolute inset-0 rounded-lg bg-primary/20"
        aria-hidden
      />
    </span>
    <span class="text-left">
      <span class="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
        Comprimir
      </span>
      <span class="block text-[10px] text-slate-500">Abrir opciones</span>
    </span>
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    ariaLabel?: string
  }>(),
  { ariaLabel: 'Abrir panel para configurar y comprimir' }
)

const emit = defineEmits<{
  click: []
}>()
</script>

<style scoped>
.compression-tab__pulse {
  animation: compression-tab-pulse 2s ease-in-out infinite;
}

@keyframes compression-tab-pulse {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0;
    transform: scale(1.4);
  }
}
</style>
