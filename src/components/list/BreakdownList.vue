<template>
  <div class="rounded-lg border border-slate-200 divide-y divide-slate-50 bg-white shadow-sm">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="flex justify-between items-center p-3 text-xs"
      :class="index === items.length - 1 ? 'bg-slate-50/50 rounded-b-lg' : ''"
    >
      <span class="text-slate-500">{{ item.label }}</span>
      <span
        class="font-semibold"
        :class="index === items.length - 1 ? 'text-emerald-600' : 'text-slate-700'"
      >
        {{ item.value }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface BreakdownItem {
  label: string
  value: string
}

defineProps<{
  items: BreakdownItem[]
}>()
</script>
