<template>
  <RecycleScroller
    v-slot="{ item }"
    class="compression-file-cards-scroller custom-scrollbar"
    :items="rows"
    :item-size="ROW_HEIGHT_PX"
    key-field="id"
  >
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 compression-file-cards-grid__row"
      :style="rowStyle"
    >
      <CompressionFileCard
        v-if="item.cells[0]?.type === 'file' && item.cells[0].file"
        :key="item.cells[0].id"
        :file="item.cells[0].file"
        class="h-full min-h-0"
      />
      <NewCompressionPlaceholder
        v-else-if="item.cells[0]?.type === 'placeholder'"
        :key="cellPlaceholderKey(item.id, 0)"
        :tour-guide-target="ADD_FILES_TOUR_TARGET"
        :disabled="store.isCompressing"
        class="h-full min-h-0"
        @add="emit('add')"
      />
      <div v-else class="bg-transparent" aria-hidden="true" />

      <CompressionFileCard
        v-if="item.cells[1]?.type === 'file' && item.cells[1].file"
        :key="item.cells[1].id"
        :file="item.cells[1].file"
        class="h-full min-h-0"
      />
      <NewCompressionPlaceholder
        v-else-if="item.cells[1]?.type === 'placeholder'"
        :key="cellPlaceholderKey(item.id, 1)"
        :tour-guide-target="ADD_FILES_TOUR_TARGET"
        :disabled="store.isCompressing"
        class="h-full min-h-0"
        @add="emit('add')"
      />
      <div v-else class="bg-transparent" aria-hidden="true" />

      <CompressionFileCard
        v-if="item.cells[2]?.type === 'file' && item.cells[2].file"
        :key="item.cells[2].id"
        :file="item.cells[2].file"
        class="h-full min-h-0"
      />
      <NewCompressionPlaceholder
        v-else-if="item.cells[2]?.type === 'placeholder'"
        :key="cellPlaceholderKey(item.id, 2)"
        :tour-guide-target="ADD_FILES_TOUR_TARGET"
        :disabled="store.isCompressing"
        class="h-full min-h-0"
        @add="emit('add')"
      />
      <div v-else class="bg-transparent" aria-hidden="true" />
    </div>
  </RecycleScroller>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import type { CompressionFileItem } from '../types/compression'
import { useCompressionSettingsStore } from '../../stores/compressionSettings'
import { STEP_ID, tourTarget } from '../../composables/useCompressionTour'
import CompressionFileCard from './CompressionFileCard.vue'
import NewCompressionPlaceholder from './NewCompressionPlaceholder.vue'

const ADD_FILES_TOUR_TARGET = tourTarget(STEP_ID.ADD_FILES)

const PLACEHOLDER_ID = '__compression_new_file_placeholder__' as const
const ROW_ID_PREFIX = 'row-' as const
const CELL_PLACEHOLDER_KEY_PREFIX = 'ph-' as const

/** Tailwind gap-5 = 1.25rem = 20px */
const GRID_GAP_PX = 20
const BASE_ROW_HEIGHT_PX = 340
const ROW_HEIGHT_PX = BASE_ROW_HEIGHT_PX + GRID_GAP_PX

type Cell =
  | { id: string; type: 'file'; file: CompressionFileItem }
  | { id: string; type: 'placeholder' }
  | null

interface GridRow {
  id: string
  cells: [Cell, Cell, Cell]
}

const store = useCompressionSettingsStore()

const rowStyle: { minHeight: string; marginBottom: string } = {
  minHeight: `${BASE_ROW_HEIGHT_PX}px`,
  marginBottom: `${GRID_GAP_PX}px`,
}

function cellPlaceholderKey(rowId: string, index: 0 | 1 | 2): string {
  return `${rowId}-${CELL_PLACEHOLDER_KEY_PREFIX}${index}`
}

function rowId(rowIndex: number): string {
  return `${ROW_ID_PREFIX}${rowIndex}`
}

const rows = computed<GridRow[]>(() => {
  const files = store.files
  const items: Array<{ id: string; type: 'file'; file: CompressionFileItem } | { id: string; type: 'placeholder' }> = files.map((file) => ({
    id: file.id,
    type: 'file' as const,
    file,
  }))
  items.push({ id: PLACEHOLDER_ID, type: 'placeholder' })

  const result: GridRow[] = []
  for (let i = 0; i < items.length; i += 3) {
    const cells: [Cell, Cell, Cell] = [
      items[i] ?? null,
      items[i + 1] ?? null,
      items[i + 2] ?? null,
    ]
    result.push({ id: rowId(i / 3), cells })
  }
  return result
})

const emit = defineEmits<{ add: [] }>()
</script>

<style scoped>
.compression-file-cards-scroller {
  height: 100%;
}

.compression-file-cards-scroller :deep(.vue-recycle-scroller__item-view) {
  box-sizing: border-box;
}
</style>
