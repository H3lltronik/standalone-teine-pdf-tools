<template>
  <div class="flex flex-1 flex-col items-center gap-16 py-10">
    <div
      v-if="!hasActiveWorkspace"
      class="flex flex-1 items-center justify-center py-20 text-slate-500"
    >
      <p class="text-sm">Selecciona o abre un documento</p>
    </div>
    <div
      v-for="(page, index) in pageViewports"
      v-else
      :key="`${tabsStore.activeTabId}-${index}`"
      class="relative flex flex-col items-center"
    >
      <div class="relative">
        <div class="absolute -left-16 top-0 flex flex-col items-center gap-2">
          <div
            class="flex h-8 w-12 items-center justify-center rounded border border-slate-200 bg-white text-xs font-bold text-slate-400"
          >
            {{ index + 1 }}
          </div>
          <button
            type="button"
            class="flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-soft transition-all hover:border-primary hover:text-primary hover:shadow-sm"
            title="Rotar WorkspaceEditorPages"
            @click="workspaceStore.rotatePage(index)"
          >
            <span class="material-symbols-outlined align-middle text-[18px] leading-none">rotate_right</span>
          </button>
        </div>
        <div
          class="relative overflow-hidden rounded-sm bg-white shadow-xl ring-1 ring-slate-200 cursor-context-menu"
          :style="{ width: `${page.width}px`, minWidth: `${page.width}px` }"
        >
          <div class="flex items-center justify-center p-0">
            <canvas
              :ref="(el) => setCanvasRef(el as HTMLCanvasElement | null, index)"
              class="block bg-white"
              :width="page.width"
              :height="page.height"
            />
          </div>
          <WorkspaceEditorAnnotationLayer
            v-if="pageViewports[index]"
            :page-index="index"
            :width="page.width"
            :height="page.height"
          />
        </div>
      </div>
    </div>
    <div v-if="hasActiveWorkspace && loading" class="flex flex-1 items-center justify-center py-20">
      <span class="material-symbols-outlined animate-spin text-4xl text-slate-400">progress_activity</span>
    </div>
    <div v-if="hasActiveWorkspace && error" class="flex flex-1 items-center justify-center py-20 text-slate-600">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount, nextTick, computed } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { PageRotation } from '../../types/workspace-editor'
import { useWorkspaceTabsStore } from '../../stores/workspaceEditorTabs'
import { useWorkspaceEditorWorkspaceStore } from '../../stores/workspaceEditorWorkspace'
import { useWorkspaceEditorAnnotationsStore } from '../../stores/workspaceEditorAnnotations'
import { capturePageToThumbnailUrl } from '../../lib/thumbnail-capture'
import WorkspaceEditorAnnotationLayer from './WorkspaceEditorAnnotationLayer.vue'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

export interface PageViewport {
  width: number
  height: number
}

const tabsStore = useWorkspaceTabsStore()
const workspaceStore = useWorkspaceEditorWorkspaceStore()
const annotationsStore = useWorkspaceEditorAnnotationsStore()

/** Tailwind: py-10 = 2.5rem = 40px, gap-16 = 4rem = 64px */
const SCROLL_PADDING_TOP = 40
const SCROLL_GAP_BETWEEN_PAGES = 64

const loading = ref(true)
const error = ref<string | null>(null)
const pageViewports = ref<PageViewport[]>([])
const canvasRefs = ref<(HTMLCanvasElement | null)[]>([])
let pdfDoc: pdfjsLib.PDFDocumentProxy | null = null
/** In-flight render tasks; cancelled when a new render starts to avoid "same canvas during multiple render()" */
let activeRenderTasks: pdfjsLib.RenderTask[] = []

const hasActiveWorkspace = computed(() => workspaceStore.activeWorkspace != null)
const pdfSrc = computed(() => workspaceStore.pdfSrc)
const scale = computed(() => workspaceStore.scale)
const pageRotations = computed(() => workspaceStore.activeWorkspace?.pageRotations ?? [])
const effectiveDisplaySlots = computed(() => workspaceStore.effectiveDisplaySlots)
const addedPages = computed(() => workspaceStore.addedPages)
const totalNumPages = computed(() => workspaceStore.totalNumPages)
const addedPagesById = computed(() => new Map(addedPages.value.map((a) => [a.id, a])))

function setCanvasRef(el: HTMLCanvasElement | null, index: number): void {
  canvasRefs.value[index] = el
}

/**
 * Returns the scrollTop value so the given page (0-based index) is at the top
 * of the scroll container. Position = paddingTop + sum(previous page heights + gaps).
 * Zoom is already reflected in pageViewports (scaled dimensions).
 * The actual scroll must be done by the parent (the element with overflow-y-auto).
 */
function getScrollTopForPage(pageIndex: number): number {
  const viewports = pageViewports.value
  if (pageIndex <= 0 || pageIndex >= viewports.length) return pageIndex === 0 ? SCROLL_PADDING_TOP : 0
  let scrollTop = SCROLL_PADDING_TOP
  for (let i = 0; i < pageIndex; i++) {
    const v = viewports[i]
    if (v) scrollTop += v.height + SCROLL_GAP_BETWEEN_PAGES
  }
  return scrollTop
}

/**
 * Returns the 0-based page index that contains the given scroll position.
 * Uses the same layout as getScrollTopForPage (padding + page heights + gaps).
 */
function getPageIndexForScrollTop(scrollTop: number): number {
  const viewports = pageViewports.value
  if (viewports.length === 0) return 0
  let index = 0
  for (let i = 0; i < viewports.length; i++) {
    if (getScrollTopForPage(i) <= scrollTop) index = i
  }
  return index
}

defineExpose({ getScrollTopForPage, getPageIndexForScrollTop })

/** 1 mm = 72/25.4 pt (PDF points). */
const MM_TO_PT = 72 / 25.4

/** Returns viewport dimensions in px for a blank page (mm, scale, rotation). */
function blankPageViewportPx(
  widthMm: number,
  heightMm: number,
  s: number,
  rotation: PageRotation
): PageViewport {
  const wPt = widthMm * MM_TO_PT
  const hPt = heightMm * MM_TO_PT
  const swap = rotation === 90 || rotation === 270
  const widthPx = (swap ? hPt : wPt) * s
  const heightPx = (swap ? wPt : hPt) * s
  return { width: widthPx, height: heightPx }
}

/** Builds viewports from current pdfDoc/scale/rotations and effective display order (PDF + added). */
async function computeViewports(): Promise<void> {
  const total = totalNumPages.value
  if (total === 0) {
    pageViewports.value = []
    return
  }
  const s = scale.value
  const rotations = pageRotations.value
  const slots = effectiveDisplaySlots.value
  const addedById = addedPagesById.value
  const viewports: PageViewport[] = []

  for (let displayIndex = 0; displayIndex < total; displayIndex++) {
    const slot = slots[displayIndex]
    const rot = rotations[displayIndex] ?? 0
    if (slot?.type === 'pdf' && pdfDoc) {
      const pdfPageNum = slot.pdfIndex + 1
      const page = await pdfDoc.getPage(pdfPageNum)
      const vp = page.getViewport({ scale: s, rotation: rot as PageRotation })
      viewports.push({ width: vp.width, height: vp.height })
    } else if (slot?.type === 'added') {
      const ap = addedById.get(slot.id)
      if (ap) {
        viewports.push(blankPageViewportPx(ap.widthMm, ap.heightMm, s, rot as PageRotation))
      } else {
        viewports.push({ width: 210 * (72 / 25.4) * s, height: 297 * (72 / 25.4) * s })
      }
    } else {
      viewports.push({ width: 210 * (72 / 25.4) * s, height: 297 * (72 / 25.4) * s })
    }
  }
  pageViewports.value = viewports
}

/** Paints every page into its canvas in display order. Requires pageViewports and canvasRefs in sync. */
async function renderAllPages(): Promise<void> {
  for (const task of activeRenderTasks) {
    task.cancel()
  }
  activeRenderTasks = []
  const viewports = pageViewports.value
  const slots = effectiveDisplaySlots.value
  const s = scale.value
  const rotations = pageRotations.value

  for (let displayIndex = 0; displayIndex < viewports.length; displayIndex++) {
    const vp = viewports[displayIndex]
    const canvas = canvasRefs.value[displayIndex]
    if (!vp || !canvas) continue
    const ctx = canvas.getContext('2d')
    if (!ctx) continue
    canvas.width = vp.width
    canvas.height = vp.height

    const slot = slots[displayIndex]
    if (slot?.type === 'pdf' && pdfDoc) {
      const pdfPageNum = slot.pdfIndex + 1
      const page = await pdfDoc.getPage(pdfPageNum)
      const rot = rotations[displayIndex] ?? 0
      const viewport = page.getViewport({ scale: s, rotation: rot as PageRotation })
      const task = page.render({
        canvasContext: ctx,
        viewport,
      })
      activeRenderTasks.push(task)
      try {
        await task.promise
      } catch {
        break
      }
    } else {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, vp.width, vp.height)
    }
  }
  activeRenderTasks = []
}

/** Generates thumbnail URLs from rendered canvases + annotations and updates the store. */
async function generateThumbnailsFromCanvases(): Promise<void> {
  const viewports = pageViewports.value
  const refs = canvasRefs.value
  const total = viewports.length
  if (total === 0) return
  await nextTick()
  for (let i = 0; i < total; i++) {
    const canvas = refs[i]
    const vp = viewports[i]
    if (!canvas || !vp) continue
    const annotations = annotationsStore.annotationsForPage(i)
    const url = await capturePageToThumbnailUrl(canvas, annotations, vp.width, vp.height)
    if (url) workspaceStore.setPageThumbnailUrl(i, url)
  }
}

async function loadAndRender(): Promise<void> {
  const src = pdfSrc.value
  if (!src) {
    loading.value = false
    pageViewports.value = []
    return
  }
  for (const task of activeRenderTasks) {
    task.cancel()
  }
  activeRenderTasks = []
  pdfDoc?.destroy()
  pdfDoc = null
  loading.value = true
  error.value = null
  pageViewports.value = []
  try {
    const loadingTask = pdfjsLib.getDocument({ url: src })
    pdfDoc = await loadingTask.promise
    workspaceStore.setNumPages(pdfDoc.numPages)
    await computeViewports()
    await nextTick()
    await renderAllPages()
    await generateThumbnailsFromCanvases()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error al cargar el PDF'
  } finally {
    loading.value = false
  }
}

async function updateViewportsAndRender(): Promise<void> {
  await computeViewports()
  await nextTick()
  await renderAllPages()
  await generateThumbnailsFromCanvases()
}

watch(
  () => [tabsStore.activeTabId, pdfSrc.value, scale.value] as const,
  () => {
    void loadAndRender()
  },
  { immediate: true }
)

watch(
  () => pageRotations.value,
  () => {
    if (pdfDoc) void updateViewportsAndRender()
  },
  { deep: true }
)

watch(
  () => effectiveDisplaySlots.value,
  () => {
    if (pdfDoc) void updateViewportsAndRender()
  },
  { deep: true }
)

const annotationsByPage = computed(() => annotationsStore.annotationsByPage)
let thumbnailRegenerateTimeout: ReturnType<typeof setTimeout> | null = null
const THUMBNAIL_DEBOUNCE_MS = 400

watch(
  () => annotationsByPage.value,
  () => {
    if (thumbnailRegenerateTimeout) clearTimeout(thumbnailRegenerateTimeout)
    thumbnailRegenerateTimeout = setTimeout(() => {
      thumbnailRegenerateTimeout = null
      if (pageViewports.value.length > 0) void generateThumbnailsFromCanvases()
    }, THUMBNAIL_DEBOUNCE_MS)
  },
  { deep: true }
)

onBeforeUnmount(() => {
  if (thumbnailRegenerateTimeout) clearTimeout(thumbnailRegenerateTimeout)
  thumbnailRegenerateTimeout = null
  for (const task of activeRenderTasks) {
    task.cancel()
  }
  activeRenderTasks = []
  pdfDoc?.destroy()
  pdfDoc = null
})
</script>
