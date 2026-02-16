<template>
  <div class="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
    <WorkspacesListTableHeader
      v-model:search-query="searchQuery"
      v-model:sort-date-created="sortDateCreated"
      v-model:sort-file-size="sortFileSize"
      v-model:sort-status="sortStatus"
      :date-created-options="dateCreatedOptions"
      :file-size-options="fileSizeOptions"
      :status-options="statusOptions"
      @new-workspace="onNewWorkspace"
    />

    <AdminTable
      :columns="tableColumns"
      :rows="tableRows"
      :pagination="pagination"
      actions-column-key="actions"
      @page-change="onPageChange"
    >
      <template #cell-thumbnail="{ row }">
        <div
          class="aspect-[3/4] w-10 overflow-hidden rounded border border-slate-200 bg-slate-100 shadow-sm"
        >
          <div
            v-if="row.thumbnailUrl"
            class="h-full w-full bg-cover bg-center"
            :style="{ backgroundImage: `url(${row.thumbnailUrl})` }"
          />
          <div
            v-else
            class="flex h-full w-full items-center justify-center"
          >
            <span class="material-symbols-outlined text-slate-300">image</span>
          </div>
        </div>
      </template>

      <template #cell-documentName="{ row }">
        <div class="flex flex-col">
          <span class="text-sm font-semibold text-slate-900">{{ row.name }}</span>
          <span class="text-[10px] text-slate-400">{{ row.createdAgo }}</span>
        </div>
      </template>

      <template #actions="{ row }">
        <ActionsPopover
          :actions="rowActions"
          @select="(key) => onRowAction(key, row as WorkspaceTableRow)"
        />
      </template>
    </AdminTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import WorkspacesListTableHeader from '../components/list-headers/WorkspacesListTableHeader.vue'
import ActionsPopover from '../components/ui/ActionsPopover.vue'
import type { ActionsPopoverItem } from '../components/ui/ActionsPopover.vue'
import AdminTable from '../components/table/AdminTable.vue'
import type { AdminTableColumn, AdminTablePagination } from '../components/table/AdminTable.vue'
import type { DropdownOption } from '../components/Forms/Dropdown.vue'
import { getLoggerFor } from '../lib/logger'

const log = getLoggerFor('workspaces-list')

export interface WorkspaceTableRow extends Record<string, unknown> {
  id: string
  thumbnailUrl?: string | null
  name: string
  createdAgo: string
  lastModified: string
  fileSize: string
  pages: number
}

const searchQuery = ref('')
const sortDateCreated = ref<string | number | null>(null)
const sortFileSize = ref<string | number | null>(null)
const sortStatus = ref<string | number | null>(null)
const currentPage = ref(1)
const pageSize = 3

const dateCreatedOptions: DropdownOption[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
]
const fileSizeOptions: DropdownOption[] = [
  { value: 'largest', label: 'Largest first' },
  { value: 'smallest', label: 'Smallest first' },
]
const statusOptions: DropdownOption[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
]

const rowActions: ActionsPopoverItem[] = [
  { key: 'open', label: 'Open', icon: 'open_in_new' },
  { key: 'rename', label: 'Rename', icon: 'edit' },
  { key: 'duplicate', label: 'Duplicate', icon: 'content_copy' },
  { key: 'delete', label: 'Delete', icon: 'delete', variant: 'danger', dividerBefore: true },
]

const workspaces = ref<WorkspaceTableRow[]>([
  {
    id: '1',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpLyzqIbaYlOEFUe3M07kUEkCpLsKRAtEZGmALxBIllYhaBEAeKTUSeconWGrFfXzcpojJYksWQAiCFOO4pYdU97PWvoVSTF39T5WrtkHbCpg8Ubr38vuMGvnhbj9c3isr8sOJDnDXx-whgw3gQNv8JZ3Nk_rK16lsMXNo9fFAic03FBdr-SMzUV6XnsiBWicYP9fAKm-up3AX-Vm1O2lQwj-Fr1GDM8RwK8asqw1MIZp3K0G01LMrqJ7EDoVuHO859mRLkjaFpvMk',
    name: 'Q3_Financial_Report.pdf',
    createdAgo: 'Created 2 days ago',
    lastModified: 'Oct 24, 2023, 14:20',
    fileSize: '2.4 MB',
    pages: 12,
  },
  {
    id: '2',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2AF8Hjx_MSzVE4nm0pCPhPOBYN9xsrlohJfAlrGxGZEkLIh6fnD0TKKFR1CyaLRueF_sCzWqRJh6tr6_4g4t_o8itjGhagATSQpmHBmtDB6DUr3WQ8WOI69t_g_ZUgv1NKQjoXcIAGZRAwbrWAj9luUrjAaG-37I50RWtT6cZjFdO9WUWHxtaY3qhvUQNjVVghdbJfy0XTt7jxrOB_3OR9GceY6SNCjDkCsud_cx0q6TQCHuLmo0PLeOYZQH_6U7Z_Z2GFEcVxcz4',
    name: 'Contract_Draft_V2.pdf',
    createdAgo: 'Created 4 days ago',
    lastModified: 'Oct 22, 2023, 09:15',
    fileSize: '856 KB',
    pages: 4,
  },
  {
    id: '3',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAK4beijxfvKZbDBfz211QHyOAxlXPNVDvHYGzT11a22Qh51y7V2yDy-1aVxoPeMa1uoVUlImYD4_5UA_p7w6IZfo3I19hCgskiMsR-smL8FZ_tCFP8sQXNr07YbySM3ydsfdfu_a6sSKKhOqMxJD5vEhKBGWBrc5uraMdu-3pV0Xt7ZabGp-mTFpRMYmBC23wGG1XKQjSJI0KCVx-0KAneOHpq0khf0yZ2te5P_P08wHQWt0PLadjWlFqMp8nelEBLhiUO5gKFZN4Y',
    name: 'Portfolio_Submissions.pdf',
    createdAgo: 'Created 1 week ago',
    lastModified: 'Oct 18, 2023, 16:45',
    fileSize: '12.8 MB',
    pages: 28,
  },
  {
    id: '4',
    thumbnailUrl: null,
    name: 'Images_to_Merge',
    createdAgo: 'Created 2 weeks ago',
    lastModified: 'Oct 10, 2023, 11:30',
    fileSize: '4.1 MB',
    pages: 8,
  },
  {
    id: '5',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpLyzqIbaYlOEFUe3M07kUEkCpLsKRAtEZGmALxBIllYhaBEAeKTUSeconWGrFfXzcpojJYksWQAiCFOO4pYdU97PWvoVSTF39T5WrtkHbCpg8Ubr38vuMGvnhbj9c3isr8sOJDnDXx-whgw3gQNv8JZ3Nk_rK16lsMXNo9fFAic03FBdr-SMzUV6XnsiBWicYP9fAKm-up3AX-Vm1O2lQwj-Fr1GDM8RwK8asqw1MIZp3K0G01LMrqJ7EDoVuHO859mRLkjaFpvMk',
    name: 'Q3_Financial_Report.pdf',
    createdAgo: 'Created 2 days ago',
    lastModified: 'Oct 24, 2023, 14:20',
    fileSize: '2.4 MB',
    pages: 12,
  },
  {
    id: '6',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2AF8Hjx_MSzVE4nm0pCPhPOBYN9xsrlohJfAlrGxGZEkLIh6fnD0TKKFR1CyaLRueF_sCzWqRJh6tr6_4g4t_o8itjGhagATSQpmHBmtDB6DUr3WQ8WOI69t_g_ZUgv1NKQjoXcIAGZRAwbrWAj9luUrjAaG-37I50RWtT6cZjFdO9WUWHxtaY3qhvUQNjVVghdbJfy0XTt7jxrOB_3OR9GceY6SNCjDkCsud_cx0q6TQCHuLmo0PLeOYZQH_6U7Z_Z2GFEcVxcz4',
    name: 'Contract_Draft_V2.pdf',
    createdAgo: 'Created 4 days ago',
    lastModified: 'Oct 22, 2023, 09:15',
    fileSize: '856 KB',
    pages: 4,
  },
  {
    id: '7',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAK4beijxfvKZbDBfz211QHyOAxlXPNVDvHYGzT11a22Qh51y7V2yDy-1aVxoPeMa1uoVUlImYD4_5UA_p7w6IZfo3I19hCgskiMsR-smL8FZ_tCFP8sQXNr07YbySM3ydsfdfu_a6sSKKhOqMxJD5vEhKBGWBrc5uraMdu-3pV0Xt7ZabGp-mTFpRMYmBC23wGG1XKQjSJI0KCVx-0KAneOHpq0khf0yZ2te5P_P08wHQWt0PLadjWlFqMp8nelEBLhiUO5gKFZN4Y',
    name: 'Portfolio_Submissions.pdf',
    createdAgo: 'Created 1 week ago',
    lastModified: 'Oct 18, 2023, 16:45',
    fileSize: '12.8 MB',
    pages: 28,
  },
  {
    id: '8',
    thumbnailUrl: null,
    name: 'Images_to_Merge',
    createdAgo: 'Created 2 weeks ago',
    lastModified: 'Oct 10, 2023, 11:30',
    fileSize: '4.1 MB',
    pages: 8,
  },
])

const tableColumns: AdminTableColumn[] = [
  { key: 'thumbnail', label: 'Thumbnail' },
  { key: 'documentName', label: 'Document Name' },
  { key: 'lastModified', label: 'Last Modified' },
  { key: 'fileSize', label: 'File Size' },
  { key: 'pages', label: 'Pages', align: 'center' },
  { key: 'actions', label: 'Actions', align: 'right' },
]

const filteredRows = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return workspaces.value
  return workspaces.value.filter(
    (w) => w.name.toLowerCase().includes(q)
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

function onNewWorkspace(): void {
  log.debug('New Workspace')
}

function onRowAction(actionKey: string, row: WorkspaceTableRow): void {
  switch (actionKey) {
    case 'open':
      onOpen(row)
      break
    case 'rename':
      onRename(row)
      break
    case 'duplicate':
      onDuplicate(row)
      break
    case 'delete':
      onDelete(row)
      break
    default:
      break
  }
}

function onOpen(row: WorkspaceTableRow): void {
  log.debug('Open', { row })
}

function onRename(row: WorkspaceTableRow): void {
  log.debug('Rename', { row })
}

function onDuplicate(row: WorkspaceTableRow): void {
  log.debug('Duplicate', { row })
}

function onDelete(row: WorkspaceTableRow): void {
  log.debug('Delete', { row })
}
</script>
