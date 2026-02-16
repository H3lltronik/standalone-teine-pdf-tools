<template>
  <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
    <WorkspaceEditorHeader @go-to-page="onGoToPage" />
    <div class="relative flex min-h-0 flex-1 overflow-hidden">
      <WorkspaceEditorFloatingToolbar />
      <main
        ref="scrollContainerRef"
        class="min-h-0 flex-1 overflow-y-auto bg-slate-100/50 custom-scrollbar"
      >
        <WorkspaceEditorPdfRenderer ref="pdfRendererRef" />
      </main>
      <WorkspaceEditorInspector />
      <div
        class="absolute bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-2xl border border-slate-200/50 bg-white/90 px-5 py-2.5 text-slate-900 shadow-dropdown backdrop-blur-md"
      >
        <button
          type="button"
          class="flex items-center justify-center text-slate-500 transition-colors hover:text-primary"
          title="Alejar"
          @click="workspaceStore.zoomOut()"
        >
          <span class="material-symbols-outlined align-middle text-xl leading-none">remove</span>
        </button>
        <span class="min-w-[3.5rem] text-center text-xs font-bold">{{ Math.round(workspaceStore.scale * 100) }}%</span>
        <button
          type="button"
          class="flex items-center justify-center text-slate-500 transition-colors hover:text-primary"
          title="Acercar"
          @click="workspaceStore.zoomIn()"
        >
          <span class="material-symbols-outlined align-middle text-xl leading-none">add</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { DEFAULT_PDF_SRC } from '../types/workspace-editor'
import { useWorkspaceTabsStore } from '../stores/workspaceEditorTabs'
import { useWorkspaceEditorWorkspaceStore } from '../stores/workspaceEditorWorkspace'
import { useWorkspaceEditorActions } from '../composables/useWorkspaceEditorActions'
import WorkspaceEditorHeader from '../components/workspace-editor/WorkspaceEditorHeader.vue'
import WorkspaceEditorFloatingToolbar from '../components/workspace-editor/WorkspaceEditorFloatingToolbar.vue'
import WorkspaceEditorPdfRenderer from '../components/workspace-editor/WorkspaceEditorPdfRenderer.vue'
import WorkspaceEditorInspector from '../components/workspace-editor/WorkspaceEditorInspector.vue'

const tabsStore = useWorkspaceTabsStore()
const workspaceStore = useWorkspaceEditorWorkspaceStore()
const { addTab } = useWorkspaceEditorActions()
const scrollContainerRef = ref<HTMLElement | null>(null)
const pdfRendererRef = ref<InstanceType<typeof WorkspaceEditorPdfRenderer> | null>(null)

onMounted(() => {
  if (tabsStore.tabs.length === 0) {
    addTab(
      { id: crypto.randomUUID(), label: 'Documento' },
      { pdfSrc: DEFAULT_PDF_SRC }
    )
  }
  scrollContainerRef.value?.addEventListener('scroll', onScroll)
})

onBeforeUnmount(() => {
  scrollContainerRef.value?.removeEventListener('scroll', onScroll)
})

function onScroll(): void {
  const el = scrollContainerRef.value
  const getPageIndex = pdfRendererRef.value?.getPageIndexForScrollTop
  if (!el || typeof getPageIndex !== 'function') return
  const index = getPageIndex(el.scrollTop)
  const current = workspaceStore.activeWorkspace?.currentPageIndex ?? -1
  if (index !== current) workspaceStore.setCurrentPageIndex(index)
}

function onGoToPage(pageIndex: number): void {
  const el = scrollContainerRef.value
  const top = pdfRendererRef.value?.getScrollTopForPage(pageIndex)
  if (el != null && top != null) {
    el.scrollTo({ top, behavior: 'smooth' })
  }
}
</script>
