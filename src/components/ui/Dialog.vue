<template>
  <TransitionRoot
    :show="open"
    as="template"
    enter="duration-200 ease-out"
    enter-from="opacity-0"
    enter-to="opacity-100"
    leave="duration-150 ease-in"
    leave-from="opacity-100"
    leave-to="opacity-0"
  >
    <Dialog class="relative z-50" :open="open" @close="onClose">
      <TransitionChild
        as="template"
        enter="duration-200 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-150 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div
          class="fixed inset-0 bg-black/30"
          aria-hidden="true"
        />
      </TransitionChild>
      <div class="fixed inset-0 w-screen overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="duration-200 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-150 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
              <DialogTitle
                v-if="$slots.title"
                class="text-lg font-semibold text-slate-900"
              >
                <slot name="title" />
              </DialogTitle>
              <DialogDescription
                v-if="$slots.description"
                class="mt-1 text-sm text-slate-500"
              >
                <slot name="description" />
              </DialogDescription>
              <div v-if="$slots.default" class="mt-4">
                <slot />
              </div>
              <div
                v-if="$slots.actions"
                class="mt-6 flex flex-wrap items-center justify-end gap-2"
              >
                <slot name="actions" />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogDescription,
} from '@headlessui/vue'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

function onClose(): void {
  emit('close')
}
</script>
