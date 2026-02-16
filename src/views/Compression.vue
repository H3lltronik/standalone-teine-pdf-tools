<template>
  <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
    <CompressionProgress />

    <main class="min-h-0 flex-1 bg-slate-100/50 overflow-y-auto custom-scrollbar py-6 md:py-8">
      <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          class="flex items-end justify-between mb-6 pb-4 border-b border-slate-200"
          data-tour-guide="tour-welcome"
        >
          <div>
            <h1 class="text-xl font-bold text-slate-900 tracking-tight">
              Archivos para Comprimir
            </h1>
            <p class="text-xs text-slate-500 mt-1">
              Gestiona el tamaño de tus archivos PDF individualmente.
            </p>
          </div>
          <Button
            data-tour-guide="tour-add-files"
            variant="ghost"
            size="xs"
            :disabled="store.isCompressing"
            @click="triggerFileInput"
          >
            <template #icon>
              <span class="material-symbols-outlined text-[16px]">add</span>
            </template>
            Añadir Archivos
          </Button>
        </div>

        <input ref="fileInputRef"
               type="file"
               accept=".pdf,application/pdf"
               multiple
               class="sr-only"
               @change="onFileInputChange" />

        <div
          class="compression-files-virtual-container min-h-[400px] overflow-hidden"
          style="height: calc(100vh - 14rem);"
          data-tour-guide="tour-files-grid"
        >
          <CompressionFileCardsGrid @add="triggerFileInput" />
        </div>
      </div>
    </main>

    <!-- Fixed sidebar overlay (below header): top-16 = header height -->
    <div
      class="fixed right-0 top-16 bottom-0 z-40 flex flex-col overflow-hidden transition-[width] duration-200 ease-out"
      :class="sidebarOpen ? 'w-80' : 'w-0'"
    >
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-x-0"
        leave-to-class="translate-x-full"
      >
        <CompressionSidebar
          v-if="sidebarOpen"
          class="h-full w-80 shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.08)]"
          @close="sidebarOpen = false"
          @compress="runBatchThenDownload"
        />
      </Transition>
    </div>

    <!-- Toggle: open sidebar when closed -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <CompressionSidebarFloatingTab
        v-if="!sidebarOpen"
        aria-label="Abrir panel para configurar y comprimir"
        @click="sidebarOpen = true"
      />
    </Transition>

    <TourGuideManager
      ref="tourManagerRef"
      :steps="compressionTourSteps"
      :labels="compressionTourLabels"
      :auto-start="false"
    />

    <Button
      variant="ghost"
      size="xs"
      class="fixed bottom-4 left-4 z-30 text-slate-500 hover:text-slate-700"
      @click="startTour"
    >
      <template #icon>
        <span class="material-symbols-outlined text-[16px]">help</span>
      </template>
      Ver tour
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Transition } from 'vue'
import { TourGuideManager } from 'v-tour-guide'
import { useCompressionTour } from '../composables/useCompressionTour'
import { useCompressionSettingsStore } from '../stores/compressionSettings'
import { useCompressionBatch } from '../composables/useCompressionBatch'
import { useAnalytics } from '../composables/useAnalytics'
import { zipService } from '../lib/services/zip-service'
import Button from '../components/ui/Button.vue'
import CompressionFileCardsGrid from '../components/compression/CompressionFileCardsGrid.vue'
import CompressionSidebar from '../components/compression/CompressionSidebar.vue'
import CompressionSidebarFloatingTab from '../components/compression/CompressionSidebarFloatingTab.vue'
import CompressionProgress from '../components/compression/CompressionProgress.vue'

const store = useCompressionSettingsStore()
const { runBatch } = useCompressionBatch()
const analytics = useAnalytics()
const { steps: compressionTourSteps, labels: compressionTourLabels } = useCompressionTour()

const fileInputRef = ref<HTMLInputElement | null>(null)
const sidebarOpen = ref(true)
const tourManagerRef = ref<InstanceType<typeof TourGuideManager> | null>(null)

function startTour() {
  analytics.trackTourStarted({ tour_id: 'compression' })
  tourManagerRef.value?.startTourGuide()
}

async function runBatchThenDownload() {
  const fileCount = store.files.length
  if (fileCount > 0) {
    analytics.trackCompressionBatchStarted({ file_count: fileCount })
  }
  await runBatch()
  const filesWithBlob = store.files.filter(
    (f): f is typeof f & { optimizedBlob: Blob } => Boolean(f.optimizedBlob)
  )
  if (filesWithBlob.length > 0) {
    analytics.trackCompressionBatchCompleted({
      file_count: filesWithBlob.length,
      success: true,
    })
    const zipInputs = filesWithBlob.map((f) => ({
      name: f.name,
      data: f.optimizedBlob,
    }))
    await zipService.downloadZip(zipInputs, {
      rootName: 'optimized-pdfs',
      zipFileName: 'optimized-pdfs.zip',
    })
    store.clearOptimizedBlobs()
  } else if (fileCount > 0) {
    analytics.trackCompressionBatchCompleted({ file_count: fileCount, success: false })
  }
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function onFileInputChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files?.length) return
  const count = files.length
  store.addLocalFiles(Array.from(files))
  analytics.trackCompressionFilesAdded({ file_count: count })
  input.value = ''
}
</script>
