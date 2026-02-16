<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
    <div class="overflow-x-auto">
      <table class="w-full min-w-max border-collapse text-left">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50/50">
            <th
              v-for="col in columns"
              :key="col.key"
              class="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400"
              :class="[col.class, alignClass(col.align)]"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="(row, rowIndex) in rows"
            :key="rowIndex"
            class="transition-colors table-row-hover group"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              class="px-6 py-4 text-sm text-slate-600"
              :class="[col.class, alignClass(col.align)]"
            >
              <slot
                v-if="col.key === actionsColumnKey && $slots.actions"
                name="actions"
                :row="row"
                :row-index="rowIndex"
              />
              <slot
                v-else
                :name="cellSlotName(col.key)"
                :row="row"
                :column="col"
                :value="getRowValue(row, col.key)"
              >
                <span>{{ formatValue(getRowValue(row, col.key)) }}</span>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      v-if="pagination"
      class="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4"
    >
      <div class="text-[11px] font-medium text-slate-500">
        Showing
        <span class="text-slate-900">{{ pagination.from }}</span>
        to
        <span class="text-slate-900">{{ pagination.to }}</span>
        of
        <span class="text-slate-900">{{ pagination.total }}</span>
        results
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-lg border border-slate-200 p-1.5 text-slate-400 transition-colors hover:bg-white hover:text-slate-600 disabled:opacity-50"
          :disabled="!pagination.hasPrev"
          aria-label="Previous page"
          @click="goPrev"
        >
          <span class="material-symbols-outlined text-lg">chevron_left</span>
        </button>
        <div class="flex items-center gap-1">
          <button
            v-for="page in pageNumbers"
            :key="page"
            type="button"
            class="flex size-8 items-center justify-center rounded-lg text-xs font-bold transition-colors"
            :class="page === pagination.currentPage
              ? 'bg-primary text-white'
              : 'text-slate-600 hover:bg-white'"
            @click="goToPage(page)"
          >
            {{ page === -1 ? '...' : page }}
          </button>
        </div>
        <button
          type="button"
          class="rounded-lg border border-slate-200 p-1.5 text-slate-400 transition-colors hover:bg-white hover:text-slate-600 disabled:opacity-50"
          :disabled="!pagination.hasNext"
          aria-label="Next page"
          @click="goNext"
        >
          <span class="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface AdminTableColumn {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  class?: string
}

export interface AdminTablePagination {
  total: number
  from: number
  to: number
  currentPage: number
  totalPages: number
  hasPrev: boolean
  hasNext: boolean
}

const props = withDefaults(
  defineProps<{
    columns: AdminTableColumn[]
    rows: Record<string, unknown>[]
    pagination?: AdminTablePagination | null
    actionsColumnKey?: string
    maxVisiblePages?: number
  }>(),
  { actionsColumnKey: 'actions', maxVisiblePages: 5 }
)

const emit = defineEmits<{
  'page-change': [page: number]
}>()

function cellSlotName(key: string): string {
  return `cell-${key}`
}

function getRowValue(row: Record<string, unknown>, key: string): unknown {
  return row[key]
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value)
}

function alignClass(align?: string): string {
  switch (align) {
    case 'center':
      return 'text-center'
    case 'right':
      return 'text-right'
    default:
      return 'text-left'
  }
}

const pageNumbers = computed(() => {
  const p = props.pagination
  if (!p || p.totalPages <= 0) return []
  const total = p.totalPages
  const current = p.currentPage
  const max = props.maxVisiblePages
  if (total <= max) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const pages: number[] = []
  let start = Math.max(1, current - Math.floor(max / 2))
  const end = Math.min(total, start + max - 1)
  if (end - start + 1 < max) start = Math.max(1, end - max + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (start > 2) {
    pages.unshift(1)
    if (start > 3) pages.splice(1, 0, -1)
  }
  if (end < total - 1) {
    pages.push(total)
    if (end < total - 2) pages.splice(pages.length - 1, 0, -1)
  }
  return pages
})

function goPrev(): void {
  if (props.pagination?.hasPrev) {
    emit('page-change', props.pagination.currentPage - 1)
  }
}

function goNext(): void {
  if (props.pagination?.hasNext) {
    emit('page-change', props.pagination.currentPage + 1)
  }
}

function goToPage(page: number): void {
  if (page > 0 && page !== props.pagination?.currentPage) {
    emit('page-change', page)
  }
}
</script>

<style scoped>
.table-row-hover:hover {
  background-color: #f1f5f9;
}
</style>
