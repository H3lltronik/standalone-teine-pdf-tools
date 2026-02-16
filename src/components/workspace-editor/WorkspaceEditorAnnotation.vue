<template>
  <Menu as="div" class="contents">
    <!-- Invisible trigger positioned at cursor for right-click; Headless UI opens menu on its click -->
    <MenuButton
      ref="menuTriggerRef"
      as="div"
      class="fixed z-[70] size-0 overflow-hidden opacity-0"
      :style="contextMenuStyle"
      tabindex="-1"
    />
    <component
      :is="annotation.type === AnnotationType.Highlight ? 'svg' : 'div'"
      class="absolute cursor-grab select-none transition-colors"
      :class="[
        annotation.type === AnnotationType.Text
          ? [
              'rounded px-1.5 py-0.5 text-slate-800',
              isSelected ? 'border-dashed border-2 border-primary bg-primary/5' : 'bg-yellow-50/80',
              isDragging && 'cursor-grabbing',
              isEditing && 'ring-2 ring-primary',
            ]
          : annotation.type === AnnotationType.Image
            ? [
                'rounded border border-slate-200 bg-white shadow-sm',
                isSelected ? 'overflow-visible border-2 border-primary ring-2 ring-primary/20' : 'overflow-hidden',
                isDragging && 'cursor-grabbing',
              ]
            : [
                'left-0 top-0 overflow-visible pointer-events-none',
                isDragging && 'cursor-grabbing',
              ],
      ]"
      :style="
        annotation.type === AnnotationType.Text
          ? textStyle
          : annotation.type === AnnotationType.Image
            ? imageStyle
            : undefined
      "
      :width="annotation.type === AnnotationType.Highlight ? containerWidth : undefined"
      :height="annotation.type === AnnotationType.Highlight ? containerHeight : undefined"
      @mousedown.stop="$emit('mousedown', $event)"
      @dblclick.stop="onDblclick"
      @contextmenu.prevent="openContextMenu"
    >
      <!-- Text annotation content -->
      <template v-if="annotation.type === AnnotationType.Text">
        <input
          v-if="isEditing"
          ref="editInputRef"
          type="text"
          class="min-w-[2ch] border-0 bg-transparent p-0 text-inherit outline-none box-border"
          :size="Math.max(2, (editingText?.length ?? 0) + 1)"
          :value="editingText"
          @input="$emit('update:editingText', ($event.target as HTMLInputElement).value)"
          @blur="$emit('blur-edit')"
          @keydown.enter="$emit('blur-edit')"
          @keydown.escape="$emit('cancel-edit')"
        >
        <span v-else>{{ annotation.text ?? 'Texto' }}</span>
      </template>
      <!-- Highlight: linear brush stroke (open path, stroke with brushHeight; color from store) -->
      <g
        v-else-if="annotation.type === AnnotationType.Highlight && annotation.path && annotation.path.length >= 2"
        class="pointer-events-auto"
      >
        <path
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          :d="highlightPathOpen(annotation.path)"
          :stroke="highlightColor"
          :stroke-width="highlightBrushHeight"
        />
        <path
          v-if="isSelected"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          :d="highlightPathOpen(annotation.path)"
          stroke="rgb(29, 78, 216)"
          stroke-width="2"
          stroke-dasharray="4 2"
          opacity="0.9"
        />
      </g>
      <!-- Image annotation content -->
      <template v-else-if="annotation.type === AnnotationType.Image">
        <img
          :src="annotation.src"
          alt=""
          class="pointer-events-none block h-full w-full select-none object-contain"
          draggable="false"
        />
        <!-- Corner resize handles when selected -->
        <template v-if="isSelected && !isDragging">
          <div
            v-for="corner in imageResizeCorners"
            :key="corner.id"
            class="absolute z-10 size-3 rounded-full border-2 border-white bg-primary shadow-md"
            :class="corner.cursor"
            :style="corner.style"
            @mousedown.stop="onImageResizeHandleMouseDown(corner.id, $event)"
          />
        </template>
      </template>
    </component>

    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="scale-95 opacity-0"
      enter-to-class="scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-95 opacity-0"
      @after-leave="onContextMenuClosed"
    >
      <MenuItems
        class="fixed z-[71] min-w-[10rem] rounded-xl border border-slate-200 bg-white py-1 shadow-dropdown focus:outline-none"
        :style="menuItemsStyle"
        @mousedown.stop
        @mouseup.stop
      >
        <MenuItem v-if="annotation.type === AnnotationType.Text" v-slot="{ active }">
          <button
            type="button"
            class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700"
            :class="active ? 'bg-slate-50' : ''"
            @click="onEdit"
          >
            <span class="material-symbols-outlined align-middle text-[18px] leading-none text-slate-500">edit</span>
            Editar
          </button>
        </MenuItem>
        <MenuItem v-slot="{ active }">
          <button
            type="button"
            class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600"
            :class="active ? 'bg-red-50' : ''"
            @click="onDelete"
          >
            <span class="material-symbols-outlined align-middle text-[18px] leading-none">delete</span>
            Eliminar
          </button>
        </MenuItem>
      </MenuItems>
    </Transition>
  </Menu>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { useWorkspaceEditorAnnotationsStore } from '../../stores/workspaceEditorAnnotations'
import {
  AnnotationType,
  TextAnnotationBorderStyle,
  DEFAULT_HIGHLIGHT_COLOR,
  DEFAULT_HIGHLIGHT_BRUSH_HEIGHT,
  type PdfAnnotation,
  type Point,
} from '../../types/workspace-editor'
import { getResolvedTextStyle } from '../../lib/services/annotations-service'

const props = defineProps<{
  annotation: PdfAnnotation
  annotationIndex: number
  pageIndex: number
  isSelected: boolean
  isDragging: boolean
  isEditing: boolean
  editingText: string
  containerWidth: number
  containerHeight: number
}>()

export type ImageResizeCorner = 'nw' | 'ne' | 'sw' | 'se'

const emit = defineEmits<{
  mousedown: [event: MouseEvent]
  resizeStart: [payload: { corner: ImageResizeCorner; event: MouseEvent }]
  dblclick: []
  edit: []
  'blur-edit': []
  'cancel-edit': []
  'update:editingText': [value: string]
  delete: []
}>()

const annotationsStore = useWorkspaceEditorAnnotationsStore()
const menuTriggerRef = ref<InstanceType<typeof MenuButton> | null>(null)
const editInputRef = ref<HTMLInputElement | null>(null)

const contextMenuStyle = ref<Record<string, string>>({ left: '0', top: '0' })
const menuItemsStyle = ref<Record<string, string>>({ left: '0', top: '0' })

const textStyle = computed(() => {
  const ann = props.annotation
  if (ann.type !== AnnotationType.Text) return {}
  const style = getResolvedTextStyle(ann)
  const borderStyle =
    style.borderStyle === TextAnnotationBorderStyle.None
      ? 'none'
      : `${style.borderWidth}px ${style.borderStyle} ${style.borderColor}`
  return {
    left: `${ann.x}px`,
    top: `${ann.y}px`,
    width: 'fit-content',
    minWidth: '2ch',
    fontFamily: style.fontFamily,
    fontSize: `${style.fontSize}px`,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    letterSpacing: `${style.letterSpacing}px`,
    lineHeight: style.lineHeight,
    color: style.color,
    border: borderStyle,
  }
})

const imageStyle = computed(() => {
  const ann = props.annotation
  if (ann.type !== AnnotationType.Image) return {}
  return {
    left: `${ann.x}px`,
    top: `${ann.y}px`,
    width: `${ann.width}px`,
    height: `${ann.height}px`,
  }
})

const imageResizeCorners: Array<{
  id: ImageResizeCorner
  cursor: string
  style: Record<string, string>
}> = [
  { id: 'nw', cursor: 'cursor-nwse-resize', style: { left: '0', top: '0', transform: 'translate(-50%, -50%)' } },
  { id: 'ne', cursor: 'cursor-nesw-resize', style: { right: '0', top: '0', left: 'auto', transform: 'translate(50%, -50%)' } },
  { id: 'sw', cursor: 'cursor-nesw-resize', style: { left: '0', bottom: '0', top: 'auto', transform: 'translate(-50%, 50%)' } },
  { id: 'se', cursor: 'cursor-nwse-resize', style: { right: '0', bottom: '0', left: 'auto', top: 'auto', transform: 'translate(50%, 50%)' } },
]

function onImageResizeHandleMouseDown(corner: ImageResizeCorner, event: MouseEvent): void {
  emit('resizeStart', { corner, event })
}

const highlightColor = computed(() => {
  const ann = props.annotation
  if (ann.type !== AnnotationType.Highlight) return DEFAULT_HIGHLIGHT_COLOR
  return ann.color ?? DEFAULT_HIGHLIGHT_COLOR
})

const highlightBrushHeight = computed(() => {
  const ann = props.annotation
  if (ann.type !== AnnotationType.Highlight) return DEFAULT_HIGHLIGHT_BRUSH_HEIGHT
  return ann.brushHeight ?? DEFAULT_HIGHLIGHT_BRUSH_HEIGHT
})

function highlightPathOpen(path: Point[]): string {
  if (path.length < 2) return ''
  const first = path[0]
  if (!first) return ''
  let d = `M ${first.x} ${first.y}`
  for (let i = 1; i < path.length; i++) {
    const pt = path[i]
    if (pt) d += ` L ${pt.x} ${pt.y}`
  }
  return d
}

function openContextMenu(e: MouseEvent): void {
  annotationsStore.setContextMenuWasOpen(true)
  contextMenuStyle.value = { left: `${e.clientX}px`, top: `${e.clientY}px` }
  menuItemsStyle.value = {
    position: 'fixed',
    left: `${e.clientX}px`,
    top: `${e.clientY}px`,
  }
  nextTick(() => {
    const el = menuTriggerRef.value?.$el ?? (menuTriggerRef.value as unknown as { $el?: HTMLElement })?.$el
    if (el && typeof el.click === 'function') el.click()
  })
}

function onContextMenuClosed(): void {
  annotationsStore.setContextMenuWasOpen(false)
}

function onDblclick(): void {
  if (props.annotation.type === AnnotationType.Text) emit('edit')
}

function onEdit(): void {
  emit('edit')
}

function onDelete(): void {
  emit('delete')
}

watch(
  () => props.isEditing,
  (editing) => {
    if (editing) nextTick(() => editInputRef.value?.focus())
  }
)
</script>
