<template>
  <div class="w-full bg-white">
    <WorkspaceEditorTabs>
      <template #actions>
        <button
          type="button"
          class="flex items-center justify-center rounded-md p-1.5 text-emerald-600 transition-colors hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Descargar PDF con anotaciones y orden actual"
          :disabled="!canExport || saving"
          @click="onSave"
        >
          <span class="material-symbols-outlined align-middle text-[24px] leading-none">save</span>
        </button>
        <WorkspaceEditorDropdown />
      </template>
    </WorkspaceEditorTabs>
    <WorkspaceEditorPages
      :model-value="pages"
      @go-to-page="$emit('go-to-page', $event)"
      @toggle-selection="workspaceStore.togglePageSelection($event)"
      @rotate="workspaceStore.rotatePage"
      @reorder="onReorder"
      @add-page="onAddPage"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWorkspaceEditorWorkspaceStore } from '../../stores/workspaceEditorWorkspace'
import { useWorkspaceEditorAnnotationsStore } from '../../stores/workspaceEditorAnnotations'
import { useWorkspaceExportPdf } from '../../composables/useWorkspaceExportPdf'
import WorkspaceEditorTabs from './WorkspaceEditorTabs.vue'
import WorkspaceEditorDropdown from './WorkspaceEditorDropdown.vue'
import WorkspaceEditorPages from './WorkspaceEditorPages.vue'
import type { AddPageConfirmPayload, PageThumbnail } from './types'
// import logger
import { getLoggerFor } from '../../lib/logger'

const log = getLoggerFor(['workspace-editor', 'header'])

defineEmits<{
  'go-to-page': [pageIndex: number]
}>()

const workspaceStore = useWorkspaceEditorWorkspaceStore()
const annotationsStore = useWorkspaceEditorAnnotationsStore()
const { downloadPdf, canExport } = useWorkspaceExportPdf()
const saving = ref(false)

const pages = computed<PageThumbnail[]>(() => {
  const totalNumPages = workspaceStore.totalNumPages
  const slots = workspaceStore.effectiveDisplaySlots
  const current = workspaceStore.activeWorkspace?.currentPageIndex ?? 0
  const urls = workspaceStore.activeWorkspace?.pageThumbnailUrls ?? []
  const selectedSet = new Set(workspaceStore.activeWorkspace?.selectedPageIndices ?? [])
  return Array.from({ length: totalNumPages }, (_, displayIndex) => {
    const slot = slots[displayIndex]
    const id =
      slot?.type === 'pdf'
        ? `page-${slot.pdfIndex}`
        : slot?.type === 'added'
          ? slot.id
          : `slot-${displayIndex}`
    const thumbnail = urls[displayIndex] ?? null
    return {
      id,
      thumbnail,
      isCurrentPage: displayIndex === current,
      checkboxSelected: selectedSet.has(displayIndex),
    }
  })
})

function onReorder(fromIndex: number, toIndex: number): void {
  log.info(`Reordering pages from ${fromIndex} to ${toIndex}`)
  workspaceStore.reorderPages(fromIndex, toIndex)
  annotationsStore.reorderAnnotationPages(fromIndex, toIndex)
}

async function onSave(): Promise<void> {
  if (!canExport || saving.value) return
  saving.value = true
  try {
    await downloadPdf()
  } finally {
    saving.value = false
  }
}

function onAddPage(payload: AddPageConfirmPayload): void {
  workspaceStore.addBlankPage(payload)
}
</script>
