<template>
  <div class="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
    <CompressionsListTableHeader
      v-model:search-query="searchQuery"
      v-model:filter-date="filterDate"
      v-model:filter-gain="filterGain"
      v-model:filter-size="filterSize"
      :date-options="dateOptions"
      :gain-options="gainOptions"
      :size-options="sizeOptions"
      @reset="onReset"
    />

    <div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      <DashboardStatCard
        label="Total Saved Data"
        value="4.2"
        unit="GB"
        icon="analytics"
        icon-variant="primary"
      >
        <template #suffix>
          <span class="flex items-center gap-1 text-sm font-bold text-emerald-500">
            <span class="material-symbols-outlined text-sm">trending_up</span>
            12%
          </span>
        </template>
      </DashboardStatCard>
      <DashboardStatCard
        label="Avg. Compression"
        value="68.4"
        unit="%"
        icon="compress"
        icon-variant="save-green"
      >
        <template #suffix>
          <span class="text-sm font-bold text-slate-400">Past 30 days</span>
        </template>
      </DashboardStatCard>
      <DashboardStatCard
        label="Total Batches"
        value="42"
        unit="jobs"
        icon="history"
        icon-variant="amber"
      >
        <template #suffix>
          <button
            type="button"
            class="text-sm font-bold text-primary hover:underline"
            @click="onViewFullReport"
          >
            View full report
          </button>
        </template>
      </DashboardStatCard>
    </div>

    <AdminTable
      :columns="tableColumns"
      :rows="tableRows"
      :pagination="pagination"
      actions-column-key="actions"
      @page-change="onPageChange"
    >
      <template #cell-batchDateId="{ row }">
        <div class="flex flex-col">
          <span class="text-sm font-bold text-slate-900">{{ row.batchDate }}</span>
          <span class="font-mono text-[10px] uppercase tracking-tight text-slate-400">{{ row.batchId }}</span>
        </div>
      </template>

      <template #cell-files="{ row }">
        <div class="flex -space-x-2">
          <div
            v-for="i in Math.min(asTableRow(row).filesCount, 2)"
            :key="i"
            class="flex h-7 w-7 items-center justify-center rounded border-2 border-white bg-slate-100"
          >
            <span class="material-symbols-outlined text-xs text-slate-400">description</span>
          </div>
          <div
            v-if="asTableRow(row).filesCount > 2"
            class="flex h-7 w-7 items-center justify-center rounded border-2 border-white bg-slate-200 text-[10px] font-bold text-slate-500"
          >
            +{{ asTableRow(row).filesCount - 2 }}
          </div>
        </div>
      </template>

      <template #cell-percentSaved="{ row }">
        <span
          class="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600"
        >
          {{ row.percentSaved }}
        </span>
      </template>

      <template #actions="{ row }">
        <div class="flex items-center justify-end gap-2">
          <button
            type="button"
            class="flex items-center gap-1 rounded-md px-3 py-1.5 text-[11px] font-bold text-primary transition-colors hover:bg-primary/5"
            @click="onDetails(row as CompressionTableRow)"
          >
            <span class="material-symbols-outlined text-sm">visibility</span>
            Details
          </button>
          <button
            type="button"
            class="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-100"
            @click="onDownloadZip(row as CompressionTableRow)"
          >
            <span class="material-symbols-outlined text-sm">download</span>
            ZIP
          </button>
        </div>
      </template>
    </AdminTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CompressionsListTableHeader from '../components/list-headers/CompressionsListTableHeader.vue'
import DashboardStatCard from '../components/cards/DashboardStatCard.vue'
import AdminTable from '../components/table/AdminTable.vue'
import type { AdminTableColumn, AdminTablePagination } from '../components/table/AdminTable.vue'
import type { DropdownOption } from '../components/Forms/Dropdown.vue'
import { getLoggerFor } from '../lib/logger'

const log = getLoggerFor('compressions-list')

export interface CompressionTableRow extends Record<string, unknown> {
  id: string
  batchDate: string
  batchId: string
  filesCount: number
  originalSize: string
  compressedSize: string
  percentSaved: string
}

const searchQuery = ref('')
const filterDate = ref<string | number | null>(null)
const filterGain = ref<string | number | null>(null)
const filterSize = ref<string | number | null>(null)
const currentPage = ref(1)
const pageSize = 10

const dateOptions: DropdownOption[] = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
]
const gainOptions: DropdownOption[] = [
  { value: '50', label: '> 50%' },
  { value: '75', label: '> 75%' },
]
const sizeOptions: DropdownOption[] = [
  { value: 'lt10', label: '< 10MB' },
  { value: '10-100', label: '10MB - 100MB' },
  { value: 'gt100', label: '> 100MB' },
]

const compressions = ref<CompressionTableRow[]>([
  {
    id: '1',
    batchDate: 'Oct 24, 2023 · 14:20',
    batchId: 'BATCH-72410-X',
    filesCount: 12,
    originalSize: '245.8 MB',
    compressedSize: '42.1 MB',
    percentSaved: '82.9%',
  },
  {
    id: '2',
    batchDate: 'Oct 22, 2023 · 09:15',
    batchId: 'BATCH-71922-A',
    filesCount: 2,
    originalSize: '18.5 MB',
    compressedSize: '12.2 MB',
    percentSaved: '34.0%',
  },
  {
    id: '3',
    batchDate: 'Oct 20, 2023 · 18:45',
    batchId: 'BATCH-68930-M',
    filesCount: 5,
    originalSize: '1.2 GB',
    compressedSize: '156.4 MB',
    percentSaved: '87.1%',
  },
  {
    id: '4',
    batchDate: 'Oct 19, 2023 · 12:30',
    batchId: 'BATCH-65411-K',
    filesCount: 1,
    originalSize: '4.5 MB',
    compressedSize: '2.1 MB',
    percentSaved: '53.3%',
  },
])

const tableColumns: AdminTableColumn[] = [
  { key: 'batchDateId', label: 'Batch Date & ID' },
  { key: 'files', label: 'Files' },
  { key: 'originalSize', label: 'Original Size', align: 'right' },
  { key: 'compressedSize', label: 'Compressed Size', align: 'right' },
  { key: 'percentSaved', label: '% Saved', align: 'center' },
  { key: 'actions', label: 'Actions', align: 'right' },
]

const filteredRows = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return compressions.value
  return compressions.value.filter(
    (c) =>
      c.batchId.toLowerCase().includes(q) ||
      c.batchDate.toLowerCase().includes(q)
  )
})

const totalItems = computed(() => filteredRows.value.length)

const tableRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredRows.value.slice(start, start + pageSize)
})

const pagination = computed<AdminTablePagination | null>(() => {
  const total = totalItems.value
  if (total === 0) return null
  const totalPages = Math.ceil(total / pageSize)
  const from = (currentPage.value - 1) * pageSize + 1
  const to = Math.min(currentPage.value * pageSize, total)
  return {
    total,
    from,
    to,
    currentPage: currentPage.value,
    totalPages,
    hasPrev: currentPage.value > 1,
    hasNext: currentPage.value < totalPages,
  }
})

function onPageChange(page: number): void {
  currentPage.value = page
}

function onReset(): void {
  searchQuery.value = ''
  filterDate.value = null
  filterGain.value = null
  filterSize.value = null
}

function onViewFullReport(): void {
  log.debug('View full report')
}

function asTableRow(row: Record<string, unknown>): CompressionTableRow {
  return row as CompressionTableRow
}

function onDetails(row: CompressionTableRow): void {
  log.debug('Details', { row })
}

function onDownloadZip(row: CompressionTableRow): void {
  log.debug('Download ZIP', { row })
}
</script>
