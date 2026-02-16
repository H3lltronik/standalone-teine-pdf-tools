<template>
  <div class="flex shrink-0 flex-col items-center gap-2">
    <button
      type="button"
      class="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-300 text-slate-400 transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
      :class="collapsed ? 'w-10 aspect-[3/4]' : 'w-24 aspect-[3/4]'"
      @click="onClick"
    >
      <span
        class="material-symbols-outlined align-middle leading-none"
        :class="collapsed ? 'text-base' : 'text-[28px]'"
      >
        add
      </span>
      <span
        v-if="!collapsed"
        class="mt-1 font-bold uppercase tracking-tighter text-[9px]"
      >
        Añadir Página
      </span>
    </button>
    <div v-if="!collapsed" class="h-[12px]" />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    collapsed?: boolean
  }>(),
  { collapsed: false }
)

const emit = defineEmits<{
  click: []
}>()

function onClick(): void {
  emit('click')
}
</script>
