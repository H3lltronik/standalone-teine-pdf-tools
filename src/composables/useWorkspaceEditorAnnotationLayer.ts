import type { Ref } from 'vue'
import { ref, computed } from 'vue'
import { useWorkspaceEditorWorkspaceStore } from '../stores/workspaceEditorWorkspace'
import { useWorkspaceEditorAnnotationsStore } from '../stores/workspaceEditorAnnotations'
import {
  EditorTool,
  AnnotationType,
  DEFAULT_HIGHLIGHT_COLOR,
  DEFAULT_HIGHLIGHT_BRUSH_HEIGHT,
  type Point,
  type PdfAnnotation,
} from '../types/workspace-editor'
import {
  pathToSvgD,
  pointFromMouseEvent,
  translatePath,
  createTextAnnotation,
  createHighlightAnnotation,
} from '../lib/services/annotations-service'

export type ImageResizeCorner = 'nw' | 'ne' | 'sw' | 'se'

export interface UseWorkspaceEditorAnnotationLayerProps {
  pageIndex: Ref<number>
  width: Ref<number>
  height: Ref<number>
}

export interface UseWorkspaceEditorAnnotationLayerOptions {
  onRequestPlaceImage?: (xNorm: number, yNorm: number) => void
}

interface DragState {
  annotationIndex: number
  startClientX: number
  startClientY: number
  startX: number
  startY: number
  startPath: Point[] | null
}

interface ImageResizeState {
  annotationIndex: number
  corner: ImageResizeCorner
  startClientX: number
  startClientY: number
  startX: number
  startY: number
  startWidth: number
  startHeight: number
}

const IMAGE_RESIZE_MIN_PX = 24

function toDisplayAnnotation(
  ann: PdfAnnotation,
  w: number,
  h: number,
  s: number
): PdfAnnotation {
  if (ann.type === AnnotationType.Text) {
    return { ...ann, x: ann.x * w, y: ann.y * h }
  }
  if (ann.type === AnnotationType.Highlight && ann.path) {
    const brushHeight = (ann.brushHeight ?? DEFAULT_HIGHLIGHT_BRUSH_HEIGHT) * s
    return {
      ...ann,
      path: ann.path.map((p) => ({ x: p.x * w, y: p.y * h })),
      brushHeight,
    }
  }
  if (ann.type === AnnotationType.Image) {
    return {
      ...ann,
      x: ann.x * w,
      y: ann.y * h,
      width: ann.width * w,
      height: ann.height * h,
    }
  }
  return ann
}

export function useWorkspaceEditorAnnotationLayer(
  props: UseWorkspaceEditorAnnotationLayerProps,
  options?: UseWorkspaceEditorAnnotationLayerOptions
) {
  const workspaceStore = useWorkspaceEditorWorkspaceStore()
  const annotationsStore = useWorkspaceEditorAnnotationsStore()

  const containerRef = ref<HTMLElement | null>(null)

  const annotations = computed(() =>
    annotationsStore.annotationsForPage(props.pageIndex.value)
  )
  const scale = computed(() => workspaceStore.scale)

  const displayAnnotations = computed(() =>
    annotations.value.map((ann) =>
      toDisplayAnnotation(
        ann,
        props.width.value,
        props.height.value,
        scale.value
      )
    )
  )

  function isSelected(annotationIndex: number): boolean {
    return annotationsStore.isAnnotationSelected(
      props.pageIndex.value,
      annotationIndex
    )
  }

  const isDrawing = ref(false)
  const currentPath = ref<Point[]>([])
  const editingIndex = ref<number | null>(null)
  const editingText = ref('')

  const dragState = ref<DragState | null>(null)
  const imageResizeState = ref<ImageResizeState | null>(null)

  const currentHighlightPathD = computed(() => pathToSvgD(currentPath.value))

  function getEventPoint(e: MouseEvent): Point {
    const target = containerRef.value
    if (!target) return { x: 0, y: 0 }
    return pointFromMouseEvent(e, target.getBoundingClientRect())
  }

  function onImageResizeStart(
    index: number,
    payload: { corner: ImageResizeCorner; event: MouseEvent }
  ): void {
    const ann = annotations.value[index]
    if (!ann || ann.type !== AnnotationType.Image) return
    const w = props.width.value
    const h = props.height.value
    imageResizeState.value = {
      annotationIndex: index,
      corner: payload.corner,
      startClientX: payload.event.clientX,
      startClientY: payload.event.clientY,
      startX: ann.x * w,
      startY: ann.y * h,
      startWidth: ann.width * w,
      startHeight: ann.height * h,
    }
    document.addEventListener('mousemove', onDocumentResizeMouseMove)
    document.addEventListener('mouseup', onDocumentResizeMouseUp)
  }

  function onDocumentResizeMouseMove(e: MouseEvent): void {
    const state = imageResizeState.value
    if (!state) return
    const ann = annotations.value[state.annotationIndex]
    if (!ann || ann.type !== AnnotationType.Image) return
    const w = props.width.value
    const h = props.height.value
    const dx = e.clientX - state.startClientX
    const dy = e.clientY - state.startClientY
    let x = state.startX
    let y = state.startY
    let width = state.startWidth
    let height = state.startHeight
    const { corner } = state
    if (corner === 'se') {
      width = state.startWidth + dx
      height = state.startHeight + dy
    } else if (corner === 'sw') {
      x = state.startX + dx
      width = state.startWidth - dx
      height = state.startHeight + dy
    } else if (corner === 'ne') {
      width = state.startWidth + dx
      y = state.startY + dy
      height = state.startHeight - dy
    } else {
      x = state.startX + dx
      y = state.startY + dy
      width = state.startWidth - dx
      height = state.startHeight - dy
    }
    if (width < IMAGE_RESIZE_MIN_PX) {
      if (corner === 'sw' || corner === 'nw')
        x = state.startX + state.startWidth - IMAGE_RESIZE_MIN_PX
      width = IMAGE_RESIZE_MIN_PX
    }
    if (height < IMAGE_RESIZE_MIN_PX) {
      if (corner === 'nw' || corner === 'ne')
        y = state.startY + state.startHeight - IMAGE_RESIZE_MIN_PX
      height = IMAGE_RESIZE_MIN_PX
    }
    annotationsStore.updateAnnotation(props.pageIndex.value, state.annotationIndex, {
      x: x / w,
      y: y / h,
      width: width / w,
      height: height / h,
    })
  }

  function onDocumentResizeMouseUp(): void {
    imageResizeState.value = null
    document.removeEventListener('mousemove', onDocumentResizeMouseMove)
    document.removeEventListener('mouseup', onDocumentResizeMouseUp)
  }

  function onAnnotationMouseDown(index: number, e: MouseEvent): void {
    if (editingIndex.value !== null) return
    if (imageResizeState.value !== null) return
    annotationsStore.setSelectedAnnotation({
      pageIndex: props.pageIndex.value,
      annotationIndex: index,
    })
    const ann = annotations.value[index]
    if (!ann) return
    const w = props.width.value
    const h = props.height.value
    if (ann.type === AnnotationType.Text) {
      dragState.value = {
        annotationIndex: index,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startX: ann.x * w,
        startY: ann.y * h,
        startPath: null,
      }
    } else if (ann.type === AnnotationType.Highlight && ann.path) {
      dragState.value = {
        annotationIndex: index,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startX: 0,
        startY: 0,
        startPath: ann.path.map((p) => ({ x: p.x * w, y: p.y * h })),
      }
    } else if (ann.type === AnnotationType.Image) {
      dragState.value = {
        annotationIndex: index,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startX: ann.x * w,
        startY: ann.y * h,
        startPath: null,
      }
    }
    if (dragState.value) {
      document.addEventListener('mousemove', onDocumentMouseMove)
      document.addEventListener('mouseup', onDocumentMouseUp)
    }
  }

  function onDocumentMouseMove(e: MouseEvent): void {
    const state = dragState.value
    if (!state) return
    const ann = annotations.value[state.annotationIndex]
    if (!ann) return
    const dx = e.clientX - state.startClientX
    const dy = e.clientY - state.startClientY
    const w = props.width.value
    const h = props.height.value
    if (ann.type === AnnotationType.Text) {
      annotationsStore.updateAnnotation(
        props.pageIndex.value,
        state.annotationIndex,
        {
          x: (state.startX + dx) / w,
          y: (state.startY + dy) / h,
        }
      )
    } else if (ann.type === AnnotationType.Highlight && state.startPath) {
      const translated = translatePath(state.startPath, dx, dy)
      annotationsStore.updateAnnotation(
        props.pageIndex.value,
        state.annotationIndex,
        {
          path: translated.map((p) => ({ x: p.x / w, y: p.y / h })),
        }
      )
    } else if (ann.type === AnnotationType.Image) {
      annotationsStore.updateAnnotation(
        props.pageIndex.value,
        state.annotationIndex,
        {
          x: (state.startX + dx) / w,
          y: (state.startY + dy) / h,
        }
      )
    }
  }

  function onDocumentMouseUp(): void {
    dragState.value = null
    document.removeEventListener('mousemove', onDocumentMouseMove)
    document.removeEventListener('mouseup', onDocumentMouseUp)
    onDocumentResizeMouseUp()
  }

  function onAnnotationEdit(index: number): void {
    const ann = annotations.value[index]
    if (!ann || ann.type !== AnnotationType.Text) return
    editingIndex.value = index
    editingText.value = ann.text ?? ''
  }

  function commitEdit(): void {
    if (editingIndex.value === null) return
    annotationsStore.updateAnnotation(
      props.pageIndex.value,
      editingIndex.value,
      {
        text: editingText.value.trim() || undefined,
      }
    )
    editingIndex.value = null
  }

  function cancelEdit(): void {
    editingIndex.value = null
  }

  function onAnnotationDelete(index: number): void {
    annotationsStore.removeAnnotation(props.pageIndex.value, index)
  }

  function onCanvasMouseDown(_e: MouseEvent): void {
    if (dragState.value !== null) return
    if (editingIndex.value !== null) {
      commitEdit()
      return
    }
    if (annotationsStore.contextMenuWasOpen) {
      annotationsStore.setContextMenuWasOpen(false)
      return
    }
    annotationsStore.setSelectedAnnotation(null)
    const tool = workspaceStore.activeTool
    if (tool === EditorTool.None) return
    const pt = getEventPoint(_e)
    const w = props.width.value
    const h = props.height.value
    if (tool === EditorTool.Text) {
      const newIndex = annotations.value.length
      annotationsStore.addAnnotation(
        props.pageIndex.value,
        createTextAnnotation(pt.x / w, pt.y / h, '')
      )
      annotationsStore.setSelectedAnnotation({
        pageIndex: props.pageIndex.value,
        annotationIndex: newIndex,
      })
      editingIndex.value = newIndex
      editingText.value = ''
      return
    }
    if (tool === EditorTool.Highlight) {
      const newIndex = annotations.value.length
      isDrawing.value = true
      currentPath.value = [pt]
      annotationsStore.setSelectedAnnotation({
        pageIndex: props.pageIndex.value,
        annotationIndex: newIndex,
      })
      return
    }
    if (tool === EditorTool.Image) {
      options?.onRequestPlaceImage?.(pt.x / w, pt.y / h)
    }
  }

  function onCanvasMouseMove(e: MouseEvent): void {
    if (!isDrawing.value || workspaceStore.activeTool !== EditorTool.Highlight)
      return
    currentPath.value = [...currentPath.value, getEventPoint(e)]
  }

  function onCanvasMouseUp(): void {
    if (isDrawing.value && currentPath.value.length >= 2) {
      const w = props.width.value
      const h = props.height.value
      const normalizedPath = currentPath.value.map((p) => ({
        x: p.x / w,
        y: p.y / h,
      }))
      annotationsStore.addAnnotation(
        props.pageIndex.value,
        createHighlightAnnotation(normalizedPath, {
          color: DEFAULT_HIGHLIGHT_COLOR,
          brushHeight: DEFAULT_HIGHLIGHT_BRUSH_HEIGHT,
        })
      )
    }
    isDrawing.value = false
    currentPath.value = []
  }

  function setEditingText(value: string): void {
    editingText.value = value
  }

  function setContainerRef(el: unknown): void {
    containerRef.value = el == null ? null : (el as HTMLElement)
  }

  return {
    containerRef,
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
  }
}
