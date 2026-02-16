<template>
  <aside class="flex h-full min-h-0 w-80 shrink-0 flex-col border-l border-slate-200 bg-white z-30 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.02)]">
    <div class="flex h-10 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
      <span class="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
        <span class="material-symbols-outlined text-[16px] text-slate-400">
          tune
        </span>
        Inspector
      </span>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar p-5">
      <template v-if="selection">
        <WorkspaceEditorInspectorTextForm
          v-if="selection.annotation.type === AnnotationType.Text"
          :page-index="selection.pageIndex"
          :annotation-index="selection.annotationIndex"
          :annotation="selection.annotation"
        />
        <WorkspaceEditorInspectorHighlightForm
          v-else-if="selection.annotation.type === AnnotationType.Highlight"
          :page-index="selection.pageIndex"
          :annotation-index="selection.annotationIndex"
          :annotation="selection.annotation"
        />
        <WorkspaceEditorInspectorImageForm
          v-else-if="selection.annotation.type === AnnotationType.Image"
          :page-index="selection.pageIndex"
          :annotation-index="selection.annotationIndex"
          :annotation="selection.annotation"
        />
      </template>
      <div
        v-else
        class="flex flex-col items-center justify-center gap-3 py-12 text-center text-slate-500"
      >
        <span class="material-symbols-outlined text-4xl text-slate-300">touch_app</span>
        <p class="text-sm font-medium">Selecciona una anotación</p>
        <p class="text-xs">Haz clic en un texto, resaltado o imagen para editarlo aquí.</p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWorkspaceEditorAnnotationsStore } from '../../stores/workspaceEditorAnnotations'
import { AnnotationType, type PdfAnnotation } from '../../types/workspace-editor'
import WorkspaceEditorInspectorTextForm from './WorkspaceEditorInspectorTextForm.vue'
import WorkspaceEditorInspectorHighlightForm from './WorkspaceEditorInspectorHighlightForm.vue'
import WorkspaceEditorInspectorImageForm from './WorkspaceEditorInspectorImageForm.vue'

const annotationsStore = useWorkspaceEditorAnnotationsStore()

interface SelectionData {
  pageIndex: number
  annotationIndex: number
  annotation: PdfAnnotation
}

const selection = computed<SelectionData | null>(() => {
  const sel = annotationsStore.selectedAnnotation
  if (!sel) return null
  const page = annotationsStore.annotationsByPage[sel.pageIndex] ?? []
  const annotation = page[sel.annotationIndex]
  if (!annotation) return null
  return {
    pageIndex: sel.pageIndex,
    annotationIndex: sel.annotationIndex,
    annotation,
  }
})
</script>
