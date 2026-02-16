<template>
  <div
    class="pointer-events-none absolute left-0 top-0"
    :style="{ width: `${width}px`, height: `${height}px` }"
  >
    <WorkspaceEditorImageAnnotationInserter
      ref="imageInserterRef"
      :page-index="pageIndex"
      @added="() => {}"
    />
    <div
      :ref="setContainerRef"
      class="pointer-events-auto relative h-full w-full"
      :class="canvasCursorClass"
      :style="{ width: `${width}px`, height: `${height}px` }"
      @mousedown="onCanvasMouseDown"
      @mousemove="onCanvasMouseMove"
      @mouseup="onCanvasMouseUp"
      @mouseleave="onCanvasMouseUp"
    >
      <WorkspaceEditorAnnotation
        v-for="(ann, i) in displayAnnotations"
        :key="i"
        :annotation="ann"
        :annotation-index="i"
        :page-index="pageIndex"
        :is-selected="isSelected(i)"
        :is-dragging="dragState?.annotationIndex === i"
        :is-editing="editingIndex === i"
        :editing-text="editingText"
        :container-width="width"
        :container-height="height"
        @mousedown="onAnnotationMouseDown(i, $event)"
        @resize-start="onImageResizeStart(i, $event)"
        @edit="onAnnotationEdit(i)"
        @blur-edit="commitEdit"
        @cancel-edit="cancelEdit"
        @update:editing-text="setEditingText($event)"
        @delete="onAnnotationDelete(i)"
      />
      <svg
        v-if="workspaceStore.activeTool === EditorTool.Highlight && currentPath.length >= 2"
        class="pointer-events-none absolute left-0 top-0 overflow-visible"
        :width="width"
        :height="height"
      >
        <path
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          :d="currentHighlightPathD"
          :stroke="DEFAULT_HIGHLIGHT_COLOR"
          :stroke-width="DEFAULT_HIGHLIGHT_BRUSH_HEIGHT"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs, computed } from 'vue'
import { useWorkspaceEditorWorkspaceStore } from '../../stores/workspaceEditorWorkspace'
import { EditorTool, DEFAULT_HIGHLIGHT_COLOR, DEFAULT_HIGHLIGHT_BRUSH_HEIGHT } from '../../types/workspace-editor'
import { useWorkspaceEditorAnnotationLayer } from '../../composables/useWorkspaceEditorAnnotationLayer'
import WorkspaceEditorAnnotation from './WorkspaceEditorAnnotation.vue'
import WorkspaceEditorImageAnnotationInserter from './WorkspaceEditorImageAnnotationInserter.vue'

const props = defineProps<{
  pageIndex: number
  width: number
  height: number
}>()

const workspaceStore = useWorkspaceEditorWorkspaceStore()

const canvasCursorClass = computed(() => {
  switch (workspaceStore.activeTool) {
    case EditorTool.Text:
      return 'cursor-text'
    case EditorTool.Highlight:
      return 'cursor-crosshair'
    case EditorTool.Image:
      return 'cursor-copy'
    default:
      return ''
  }
})
const imageInserterRef = ref<InstanceType<typeof WorkspaceEditorImageAnnotationInserter> | null>(null)

const {
  setContainerRef,
  displayAnnotations,
  isSelected,
  dragState,
  editingIndex,
  editingText,
  setEditingText,
  currentPath,
  currentHighlightPathD,
  onAnnotationMouseDown,
  onImageResizeStart,
  onAnnotationEdit,
  commitEdit,
  cancelEdit,
  onAnnotationDelete,
  onCanvasMouseDown,
  onCanvasMouseMove,
  onCanvasMouseUp,
} = useWorkspaceEditorAnnotationLayer(toRefs(props), {
  onRequestPlaceImage: (xNorm, yNorm) => {
    imageInserterRef.value?.openFileDialog(xNorm, yNorm)
  },
})
</script>
