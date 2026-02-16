<template>
  <aside class="absolute left-6 top-8 z-40">
    <div
      class="flex flex-col gap-1 rounded-xl border border-slate-200/60 bg-white/80 p-1 shadow-lg backdrop-blur"
    >
      <button
        type="button"
        class="flex items-center justify-center rounded-lg p-2.5 text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary"
        title="Acercar"
        @click="workspaceStore.zoomIn()"
      >
        <span class="material-symbols-outlined align-middle text-[24px] leading-none">add_circle</span>
      </button>
      <button
        type="button"
        class="flex items-center justify-center rounded-lg p-2.5 text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary"
        title="Alejar"
        @click="workspaceStore.zoomOut()"
      >
        <span class="material-symbols-outlined align-middle text-[24px] leading-none">remove_circle</span>
      </button>
      <div class="mx-2 my-1 h-px bg-slate-100" />
      <button
        type="button"
        class="flex items-center justify-center rounded-lg p-2.5 transition-colors"
        :class="workspaceStore.activeTool === EditorTool.Text ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-primary'"
        title="Agregar texto"
        @click="workspaceStore.setActiveTool(EditorTool.Text)"
      >
        <span class="material-symbols-outlined align-middle text-[24px] leading-none">text_fields</span>
      </button>
      <button
        type="button"
        class="flex items-center justify-center rounded-lg p-2.5 transition-colors"
        :class="workspaceStore.activeTool === EditorTool.Highlight ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-primary'"
        title="Resaltado"
        @click="workspaceStore.setActiveTool(EditorTool.Highlight)"
      >
        <span class="material-symbols-outlined align-middle text-[24px] leading-none">ink_highlighter</span>
      </button>
      <button
        type="button"
        class="flex items-center justify-center rounded-lg p-2.5 transition-colors"
        :class="workspaceStore.activeTool === EditorTool.Image ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-primary'"
        title="Insertar imagen"
        @click="workspaceStore.setActiveTool(EditorTool.Image)"
      >
        <span class="material-symbols-outlined align-middle text-[24px] leading-none">image</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useWorkspaceEditorWorkspaceStore } from '../../stores/workspaceEditorWorkspace'
import { EditorTool } from '../../types/workspace-editor'

const workspaceStore = useWorkspaceEditorWorkspaceStore()
</script>
