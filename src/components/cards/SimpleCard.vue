<template>
  <div
    class="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 text-left shadow-sm transition-all hover:border-slate-400 hover:shadow-xl"
    @click="$emit('click')"
    @mouseenter="$emit('hover')"
  >
    <div class="high-contrast-tile group flex w-full rounded-xl">
      <InfoRow
        :title="title"
        :description="description"
        root-class="gap-5 p-6"
        icon-class="h-12 w-12 rounded-full bg-blue-50 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white"
        title-class="text-lg font-bold"
        description-class="text-sm"
        action-class="text-slate-300 transition-colors group-hover:text-accent"
      >
        <template #icon>
          <slot name="icon">
            <span class="material-symbols-outlined text-2xl">unfold_less</span>
          </slot>
        </template>
        <template #action>
          <slot name="action">
            <span class="material-symbols-outlined">arrow_forward</span>
          </slot>
        </template>
      </InfoRow>
    </div>
  </div>
</template>

<script setup lang="ts">
import InfoRow from '../list/InfoRow.vue'

defineProps<{
  title: string
  description: string
}>()

defineEmits<{
  click: []
  hover: []
}>()
</script>
