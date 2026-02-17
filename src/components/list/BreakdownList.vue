<template>
  <div class="rounded-lg border border-slate-200 divide-y divide-slate-50 bg-white shadow-sm">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="flex justify-between items-center gap-2 p-3 text-xs"
      :class="index === items.length - 1 && !item.warning ? 'bg-slate-50/50 rounded-b-lg' : ''"
    >
      <span class="text-slate-500">{{ item.label }}</span>
      <span
        v-if="item.warning"
        class="flex items-center gap-1 font-semibold text-red-600"
      >
        <span class="material-symbols-outlined text-[10px] stroke-2">arrow_upward</span>
        {{ item.value }}
        <InfoPopover placement="left">
          {{ item.warning }}
        </InfoPopover>
      </span>
      <span
        v-else
        class="font-semibold shrink-0"
        :class="index === items.length - 1 ? 'text-emerald-600' : 'text-slate-700'"
      >
        {{ item.value }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import InfoPopover from '../ui/InfoPopover.vue'

export interface BreakdownItem {
  label: string
  value: string
  /** When set, value is shown in red with arrow up and this text in the (?) popover. */
  warning?: string
}

defineProps<{
  items: BreakdownItem[]
}>()
</script>
