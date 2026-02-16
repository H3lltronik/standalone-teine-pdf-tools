<template>
  <Button
    variant="placeholder"
    :disabled="disabled"
    @click="emit('add')"
  >
    <div
      class="h-14 w-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-3 group-hover:bg-white group-hover:shadow-sm group-hover:scale-110 transition-all group-hover:text-primary"
    >
      <span class="material-symbols-outlined text-2xl">add_photo_alternate</span>
    </div>
    <span class="font-bold text-xs text-slate-600 group-hover:text-primary">
      Agregar otro PDF
    </span>
    <span class="text-[10px] text-slate-400 mt-1">o arrastra archivos aquí</span>
  </Button>
</template>

<script setup lang="ts">
import Button from '../ui/Button.vue'

withDefaults(
  defineProps<{ disabled?: boolean }>(),
  { disabled: false }
)

const emit = defineEmits<{
  add: []
}>()
</script>
