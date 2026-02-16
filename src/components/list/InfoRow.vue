<template>
  <div
    class="flex w-full items-center text-left"
    :class="rootClass"
  >
    <div
      class="flex shrink-0 items-center justify-center"
      :class="iconClass"
    >
      <slot name="icon">
        <span class="material-symbols-outlined text-xl">folder</span>
      </slot>
    </div>
    <div class="min-w-0 flex-1">
      <p
        class="font-semibold text-slate-900"
        :class="titleClass"
      >
        {{ title }}
      </p>
      <p
        class="text-slate-500"
        :class="descriptionClass"
      >
        {{ description }}
      </p>
    </div>
    <div :class="actionClass">
      <slot name="action">
        <span class="material-symbols-outlined">chevron_right</span>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
  /** Root row (gap, padding). */
  rootClass?: string
  /** Icon wrapper (size, shape, bg, color). */
  iconClass?: string
  /** Title text. */
  titleClass?: string
  /** Description text. */
  descriptionClass?: string
  /** Action icon wrapper. */
  actionClass?: string
}>()
</script>
