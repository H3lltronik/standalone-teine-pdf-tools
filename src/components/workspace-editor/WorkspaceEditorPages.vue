<template>
  <div class="relative z-40 border-b border-slate-200 bg-white transition-[padding]">
    <div
      class="mx-auto w-full max-w-7xl transition-[padding]"
      :class="collapsed ? 'px-2 sm:px-3' : 'px-4 sm:px-6 lg:px-8'"
    >
      <div
        class="flex w-full items-center overflow-x-auto custom-scrollbar transition-[gap,padding]"
        :class="collapsed ? 'gap-2 py-1.5' : 'gap-6 py-5'"
      >
        <div
          v-for="(page, index) in pages"
          :key="page.id"
          class="flex shrink-0"
          :class="{ 'opacity-50': draggedIndex === index }"
          draggable="true"
          @dragstart="onDragStart($event, index)"
          @dragend="onDragEnd"
          @dragover.prevent="onDragOver($event, index)"
          @drop.prevent="onDrop(index)"
        >
          <WorkspaceEditorPageThumbnail
            :page="page"
            :page-index="index"
            :is-current-page="page.isCurrentPage"
            :checkbox-selected="page.checkboxSelected"
            :collapsed="collapsed"
            class="cursor-grab active:cursor-grabbing"
            @go-to="onGoToPage(index)"
            @toggle-selection="onToggleSelection(index)"
            @rotate="onRotate(index)"
          />
        </div>
        <WorkspaceEditorAddPage
          :collapsed="collapsed"
          @click="openAddPageDialog = true"
          @files-selected="onFilesSelected"
        />
      </div>
    </div>
    <AddPageDialog
      :open="openAddPageDialog"
      @close="openAddPageDialog = false"
      @confirm="onAddPageConfirm"
    />
    <button
      type="button"
      class="absolute left-1/2 z-[41] flex -translate-x-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-md transition-all hover:bg-slate-50 hover:text-primary"
      :class="collapsed ? '-bottom-2 h-6 w-6' : '-bottom-3 h-8 w-8'"
      :title="collapsed ? 'Expandir barra de miniaturas' : 'Contraer barra de miniaturas'"
      @click="toggleCollapsed"
    >
      <span
        class="material-symbols-outlined flex h-full w-full items-center justify-center leading-none"
        :class="collapsed ? 'text-sm' : 'text-lg'"
      >
        {{ collapsed ? 'expand_more' : 'expand_less' }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AddPageConfirmPayload, PageThumbnail } from './types'
import WorkspaceEditorPageThumbnail from './WorkspaceEditorPageThumbnail.vue'
import WorkspaceEditorAddPage from './WorkspaceEditorAddPage.vue'
import AddPageDialog from './AddPageDialog.vue'

const props = withDefaults(
  defineProps<{
    modelValue?: PageThumbnail[]
  }>(),
  { modelValue: () => [] }
)

const emit = defineEmits<{
  'go-to-page': [pageIndex: number]
  'toggle-selection': [pageIndex: number]
  rotate: [pageIndex: number]
  'files-selected': [files: File[]]
  reorder: [fromIndex: number, toIndex: number]
  'add-page': [payload: AddPageConfirmPayload]
}>()

const draggedIndex = ref<number | null>(null)
const openAddPageDialog = ref(false)
const collapsed = ref(false)

const pages = computed(() => props.modelValue)

function onGoToPage(pageIndex: number): void {
  emit('go-to-page', pageIndex)
}

function onToggleSelection(pageIndex: number): void {
  emit('toggle-selection', pageIndex)
}

function onRotate(pageIndex: number): void {
  emit('rotate', pageIndex)
}

function onFilesSelected(files: File[]): void {
  emit('files-selected', files)
}

function onAddPageConfirm(payload: AddPageConfirmPayload): void {
  openAddPageDialog.value = false
  emit('add-page', payload)
}

function onDragStart(event: DragEvent, index: number): void {
  draggedIndex.value = index
  event.dataTransfer?.setData('text/plain', String(index))
  event.dataTransfer!.effectAllowed = 'move'
}

function onDragEnd(): void {
  draggedIndex.value = null
}

function onDragOver(event: DragEvent, index: number): void {
  if (draggedIndex.value === null || draggedIndex.value === index) return
  event.dataTransfer!.dropEffect = 'move'
}

function onDrop(toIndex: number): void {
  const from = draggedIndex.value
  draggedIndex.value = null
  if (from !== null && from !== toIndex) {
    emit('reorder', from, toIndex)
  }
}

function toggleCollapsed(): void {
  collapsed.value = !collapsed.value
}
</script>
