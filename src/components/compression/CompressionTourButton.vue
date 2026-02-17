<template>
  <Button
    variant="ghost"
    size="xs"
    class="tour-pulse-btn fixed bottom-20 left-4 z-30 text-primary hover:text-primary-dark"
    @click="emit('click')"
  >
    <template #icon>
      <span class="material-symbols-outlined text-[16px]">help</span>
    </template>
    Ver tour
  </Button>
</template>

<script setup lang="ts">
import Button from '../ui/Button.vue'

const emit = defineEmits<{
  click: []
}>()
</script>

<style scoped>
.tour-pulse-btn {
  animation: tour-pulse 2s ease-in-out infinite;
}

@keyframes tour-pulse {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-primary) 45%, transparent);
  }
  100% {
    box-shadow: 0 0 0 8px color-mix(in srgb, var(--color-primary) 0%, transparent);
  }
}
</style>
