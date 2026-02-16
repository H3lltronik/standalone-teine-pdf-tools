<template>
  <div class="mb-8">
    <div class="mb-6">
      <Breadcrumb :items="breadcrumbItems" />
      <h1 class="text-2xl font-bold text-slate-900">
        All Compressions
      </h1>
    </div>

    <div class="mb-6 flex flex-wrap items-center gap-4 rounded-xl">
      <div class="relative min-w-[300px] flex-1 max-w-xl">
        <Input
          :model-value="searchQuery"
          placeholder="Search batch name or file..."
          type="search"
          @update:model-value="$emit('update:searchQuery', $event)"
        >
          <template #prepend>
            <span class="material-symbols-outlined">search</span>
          </template>
        </Input>
      </div>
      <div class="flex w-full flex-wrap items-center gap-3 lg:w-auto lg:flex-1 lg:flex-nowrap lg:justify-end">
        <div class="min-w-0 flex-1 max-w-44">
          <OptionsPopover
            :model-value="filterDate"
            :options="dateOptions"
            placeholder="Compression Date"
            @update:model-value="$emit('update:filterDate', $event)"
          />
        </div>
        <div class="min-w-0 flex-1 max-w-44">
          <OptionsPopover
            :model-value="filterGain"
            :options="gainOptions"
            placeholder="Optimization Gain"
            @update:model-value="$emit('update:filterGain', $event)"
          />
        </div>
        <div class="min-w-0 flex-1 max-w-44">
          <OptionsPopover
            :model-value="filterSize"
            :options="sizeOptions"
            placeholder="Original Size"
            @update:model-value="$emit('update:filterSize', $event)"
          />
        </div>
        <button
          type="button"
          class="flex shrink-0 items-center gap-2 rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-slate-200 hover:bg-slate-100"
          @click="$emit('reset')"
        >
          <span class="material-symbols-outlined text-xl">filter_list</span>
          <span>Reset</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Breadcrumb from '../layout/Breadcrumb.vue'
import Input from '../Forms/Input.vue'
import OptionsPopover from '../Forms/OptionsPopover.vue'
import type { DropdownOption } from '../Forms/Dropdown.vue'

const breadcrumbItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Compressions History' },
]

defineProps<{
  searchQuery: string
  filterDate: string | number | null
  filterGain: string | number | null
  filterSize: string | number | null
  dateOptions: DropdownOption[]
  gainOptions: DropdownOption[]
  sizeOptions: DropdownOption[]
}>()

defineEmits<{
  'update:searchQuery': [value: string]
  'update:filterDate': [value: string | number | null]
  'update:filterGain': [value: string | number | null]
  'update:filterSize': [value: string | number | null]
  reset: []
}>()
</script>
