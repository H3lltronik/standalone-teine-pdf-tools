<template>
  <div class="w-full border-b border-slate-200 bg-white">
    <div class="mx-auto flex h-12 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
      <div class="flex h-full flex-1 items-center overflow-x-auto custom-scrollbar min-w-0">
        <div class="flex h-full shrink-0 items-center gap-1 border-r border-slate-200 px-3">
          <button
            type="button"
            class="flex items-center justify-center rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-primary"
            title="Deshacer"
            @click="onUndo"
          >
            <span class="material-symbols-outlined align-middle text-[20px] leading-none">undo</span>
          </button>
          <button
            type="button"
            class="flex items-center justify-center rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-primary"
            title="Rehacer"
            @click="onRedo"
          >
            <span class="material-symbols-outlined align-middle text-[20px] leading-none">redo</span>
          </button>
        </div>
        <div class="flex h-full min-w-0 flex-1 items-center">
          <div
            v-for="tab in tabsStore.tabs"
            :key="tab.id"
            role="button"
            tabindex="0"
            class="group relative z-10 flex h-full min-w-[180px] max-w-[240px] cursor-pointer items-center gap-2 border-r border-slate-200 px-4 transition-colors"
            :class="isActive(tab.id) ? 'bg-white' : 'bg-slate-50/50 hover:bg-white'"
            @click="tabsStore.setActiveTab(tab.id)"
            @keydown.enter="tabsStore.setActiveTab(tab.id)"
          >
            <span
              class="material-symbols-outlined align-middle text-[18px] leading-none"
              :class="isActive(tab.id) ? 'text-primary' : 'text-slate-400 group-hover:text-primary'"
            >
              description
            </span>
            <span
              class="truncate text-[11px] font-medium"
              :class="isActive(tab.id) ? 'font-semibold text-slate-900' : 'text-slate-500 group-hover:text-slate-900'"
            >
              {{ tab.label }}
            </span>
            <button
              type="button"
              class="ml-auto flex items-center justify-center rounded p-0.5 text-slate-400 transition-opacity hover:bg-slate-100"
              :class="isActive(tab.id) ? '' : 'opacity-0 group-hover:opacity-100'"
              title="Cerrar"
              @click.stop="closeTab(tab.id)"
            >
              <span class="material-symbols-outlined align-middle text-[18px] leading-none">close</span>
            </button>
            <div
              v-if="isActive(tab.id)"
              class="absolute bottom-0 left-0 h-[2px] w-full bg-primary"
            />
          </div>
          <button
            type="button"
            class="flex h-full shrink-0 items-center justify-center border-r border-slate-200 px-4 text-slate-400 transition-colors hover:bg-slate-50 hover:text-primary"
            title="Nuevo documento"
            @click="onNewDocument"
          >
            <span class="material-symbols-outlined align-middle text-[24px] leading-none">add</span>
          </button>
        </div>
      </div>
      <div
        v-if="$slots.actions"
        class="flex h-full shrink-0 items-center gap-3 border-l border-slate-200 px-4"
      >
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DEFAULT_PDF_SRC } from '../../types/workspace-editor'
import { useWorkspaceTabsStore } from '../../stores/workspaceEditorTabs'
import { useWorkspaceEditorActions } from '../../composables/useWorkspaceEditorActions'

const tabsStore = useWorkspaceTabsStore()
const { addTab, closeTab } = useWorkspaceEditorActions()

function isActive(id: string): boolean {
  return tabsStore.activeTabId === id
}

function onUndo(): void {
  // TODO: wire undo
}

function onRedo(): void {
  // TODO: wire redo
}

function onNewDocument(): void {
  const count = tabsStore.tabs.length + 1
  addTab(
    { id: crypto.randomUUID(), label: `Documento ${count}` },
    { pdfSrc: DEFAULT_PDF_SRC }
  )
}
</script>
