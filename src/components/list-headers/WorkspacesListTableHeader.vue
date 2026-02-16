<template>
  <div class="mb-8">
    <h1 class="mb-6 text-2xl font-bold text-slate-900">
      Workspaces
    </h1>
    <div class="flex flex-col items-start gap-4 lg:flex-row lg:items-center">
      <div class="relative w-full flex-1 lg:max-w-xl">
        <Input
          :model-value="searchQuery"
          placeholder="Search workspaces..."
          type="search"
          @update:model-value="$emit('update:searchQuery', $event)"
        >
          <template #prepend>
            <span class="material-symbols-outlined">search</span>
          </template>
        </Input>
      </div>
      <div class="flex w-full flex-wrap items-center gap-3 lg:w-auto lg:flex-1 lg:flex-nowrap lg:justify-end">
        <div class="min-w-40 flex-1 max-w-48">
          <OptionsPopover
            :model-value="sortDateCreated"
            :options="dateCreatedOptions"
            placeholder="Date Created"
            @update:model-value="$emit('update:sortDateCreated', $event)"
          />
        </div>
        <div class="min-w-0 flex-1 max-w-36">
          <OptionsPopover
            :model-value="sortFileSize"
            :options="fileSizeOptions"
            placeholder="File Size"
            @update:model-value="$emit('update:sortFileSize', $event)"
          />
        </div>
        <div class="min-w-0 flex-1 max-w-36">
          <OptionsPopover
            :model-value="sortStatus"
            :options="statusOptions"
            placeholder="Status"
            @update:model-value="$emit('update:sortStatus', $event)"
          />
        </div>
        <div class="mx-1 hidden h-8 w-px shrink-0 bg-slate-200 sm:block" />
        <button
          type="button"
          class="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] transition-all hover:bg-blue-600"
          @click="$emit('new-workspace')"
        >
          <span class="material-symbols-outlined text-lg">add</span>
          <span>New Workspace</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Input from '../Forms/Input.vue'
import OptionsPopover from '../Forms/OptionsPopover.vue'
import type { DropdownOption } from '../Forms/Dropdown.vue'

defineProps<{
  searchQuery: string
  sortDateCreated: string | number | null
  sortFileSize: string | number | null
  sortStatus: string | number | null
  dateCreatedOptions: DropdownOption[]
  fileSizeOptions: DropdownOption[]
  statusOptions: DropdownOption[]
}>()

defineEmits<{
  'update:searchQuery': [value: string]
  'update:sortDateCreated': [value: string | number | null]
  'update:sortFileSize': [value: string | number | null]
  'update:sortStatus': [value: string | number | null]
  'new-workspace': []
}>()
</script>
