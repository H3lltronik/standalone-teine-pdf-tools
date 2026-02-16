<template>
  <input
    ref="fileInputRef"
    type="file"
    accept="image/*"
    class="hidden"
    aria-hidden="true"
    tabindex="-1"
    @change="onFileSelected"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWorkspaceEditorAnnotationsStore } from '../../stores/workspaceEditorAnnotations'
import { createImageAnnotation, DEFAULT_IMAGE_ANNOTATION_WIDTH } from '../../lib/services/annotations-service'

const props = defineProps<{
  pageIndex: number
}>()

const emit = defineEmits<{
  added: [payload: { annotationIndex: number }]
}>()

const annotationsStore = useWorkspaceEditorAnnotationsStore()
const fileInputRef = ref<HTMLInputElement | null>(null)

const pendingPlace = ref<{ xNorm: number; yNorm: number } | null>(null)

/** Opens the file dialog to pick an image; the image will be placed at (xNorm, yNorm) when selected. */
function openFileDialog(xNorm: number, yNorm: number): void {
  pendingPlace.value = { xNorm, yNorm }
  fileInputRef.value?.click()
}

function onFileSelected(e: Event): void {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  const pending = pendingPlace.value
  pendingPlace.value = null
  if (!pending || !file || !file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = () => {
    const src = reader.result as string
    const img = new Image()
    img.onload = () => {
      const aspect = img.naturalHeight / img.naturalWidth
      const widthNorm = DEFAULT_IMAGE_ANNOTATION_WIDTH
      const heightNorm = Math.min(widthNorm * aspect, 0.8)
      annotationsStore.addAnnotation(
        props.pageIndex,
        createImageAnnotation(pending.xNorm, pending.yNorm, widthNorm, heightNorm, src)
      )
      const annotationIndex = annotationsStore.annotationsForPage(props.pageIndex).length - 1
      annotationsStore.setSelectedAnnotation({ pageIndex: props.pageIndex, annotationIndex })
      emit('added', { annotationIndex })
    }
    img.onerror = () => {}
    img.src = src
  }
  reader.onerror = () => {}
  reader.readAsDataURL(file)
}

defineExpose({
  openFileDialog,
})
</script>
