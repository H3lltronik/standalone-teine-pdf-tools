<template>
  <nav
    class="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-400"
    aria-label="Breadcrumb"
  >
    <template v-for="(item, i) in items" :key="i">
      <span v-if="i > 0" class="shrink-0 text-slate-400" aria-hidden="true">
        <span class="material-symbols-outlined text-sm">chevron_right</span>
      </span>
      <router-link
        v-if="item.to"
        :to="item.to"
        class="transition-colors hover:text-slate-600"
      >
        {{ item.label }}
      </router-link>
      <span v-else class="text-slate-900">
        {{ item.label }}
      </span>
    </template>
  </nav>
</template>

<script setup lang="ts">
export interface BreadcrumbItem {
  label: string
  to?: string
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>
