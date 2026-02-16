<template>
  <div
    class="group relative flex shrink-0 flex-col items-center"
    :class="collapsed ? 'gap-0.5' : 'gap-2'"
  >
    <div
      class="relative flex flex-col overflow-hidden bg-white shadow-soft transition-all"
      :class="[
        collapsed ? 'w-10 aspect-[3/4] rounded border' : 'w-24 aspect-[3/4] rounded-md border-2',
        isCurrentPage
          ? 'border-primary ring-4 ring-primary/5'
          : 'border-slate-200 hover:border-primary/50',
      ]"
    >
      <div
        class="absolute inset-0 cursor-pointer bg-cover bg-center"
        :style="{ backgroundImage: page.thumbnail ? `url(${page.thumbnail})` : undefined }"
        @click="onGoTo"
      />
      <div v-if="!collapsed" class="absolute left-1.5 top-1.5">
        <input
          type="checkbox"
          class="h-4 w-4 cursor-pointer rounded border-slate-300 bg-white/90 text-primary focus:ring-primary"
          :checked="checkboxSelected"
          @click.stop="onToggleSelection"
        >
      </div>
      <button
        v-if="!collapsed"
        type="button"
        class="absolute bottom-1.5 right-1.5 flex items-center justify-center rounded-md border border-slate-200 bg-white/90 p-1 text-slate-600 shadow-sm transition-all hover:text-primary"
        title="Rotar página 90°"
        @click.stop="onRotate"
      >
        <span class="material-symbols-outlined align-middle text-[18px] leading-none">rotate_right</span>
      </button>
    </div>
    <div v-if="!collapsed" class="flex flex-col items-center">
      <span
        class="font-bold uppercase tracking-wide text-[10px]"
        :class="isCurrentPage ? 'text-primary' : 'text-slate-400'"
      >
        Página {{ pageIndex + 1 }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PageThumbnail } from './types'

defineProps<{
  page: PageThumbnail
  pageIndex: number
  isCurrentPage: boolean
  checkboxSelected: boolean
  collapsed?: boolean
}>()

const emit = defineEmits<{
  'go-to': []
  'toggle-selection': []
  rotate: []
}>()

function onGoTo(): void {
  emit('go-to')
}

function onToggleSelection(): void {
  emit('toggle-selection')
}

function onRotate(): void {
  emit('rotate')
}
</script>
