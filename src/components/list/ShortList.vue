<template>
  <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <ul class="divide-y divide-slate-200">
      <li
        v-for="(item, index) in items"
        :key="item.id ?? index"
        class="group transition-colors hover:bg-slate-50"
      >
        <button
          type="button"
          class="w-full cursor-pointer text-left"
          @click="onClick(item)"
          @mouseenter="onHover(item)"
        >
          <InfoRow
            :title="item.title"
            :description="item.description"
            root-class="gap-4 p-4"
            icon-class="h-10 w-10 rounded-lg bg-slate-100 text-slate-600"
            title-class="truncate text-sm"
            description-class="text-xs"
            action-class="text-lg text-slate-300 transition-colors group-hover:text-slate-500"
          >
            <template #icon>
              <slot
                name="icon"
                :item="item"
                :index="index"
              >
                <span class="material-symbols-outlined text-xl">folder</span>
              </slot>
            </template>
          </InfoRow>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import InfoRow from './InfoRow.vue'

export interface ShortListItem {
  id?: string
  title: string
  description: string
}

const props = defineProps<{
  items: ShortListItem[]
}>()

const emit = defineEmits<{
  click: [item: ShortListItem]
  hover: [item: ShortListItem]
}>()

function onClick(item: ShortListItem) {
  emit('click', item)
}

function onHover(item: ShortListItem) {
  emit('hover', item)
}
</script>
