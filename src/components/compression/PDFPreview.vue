<template>
  <div class="aspect-[3/4] p-2 overflow-hidden relative">
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      loading="lazy"
      decoding="async"
      class="w-full h-full object-contain object-top"
    />
    <template v-else>
      <div class="w-full h-full space-y-2 p-1 opacity-60">
        <div class="h-1.5 w-3/4 bg-slate-200 rounded-sm" />
        <div class="h-1.5 w-full bg-slate-200 rounded-sm" />
        <div
          class="h-12 w-full bg-slate-100 rounded-sm mt-3 flex items-center justify-center border border-dashed border-slate-200">
          <span class="material-symbols-outlined text-slate-300 text-lg">
            bar_chart
          </span>
        </div>
      </div>
      <div
        v-if="loading"
        class="absolute inset-0 flex items-center justify-center bg-white/70 rounded-sm"
        aria-busy="true"
        aria-label="Cargando vista previa">
        <span class="material-symbols-outlined animate-spin text-xl text-slate-400" aria-hidden>
          progress_activity
        </span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  /** Object URL de la imagen de vista previa (primera página del PDF). */
  src?: string
  /** Texto alternativo para la imagen. */
  alt: string
  /** True mientras se genera la vista previa. */
  loading?: boolean
}>()
</script>
