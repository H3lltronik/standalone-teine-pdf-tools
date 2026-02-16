<template>
  <TransitionRoot
    :show="modelValue"
    as="template"
  >
    <div class="relative z-[100] md:hidden">
      <TransitionChild
        as="template"
        enter="duration-200 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-150 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <button
          type="button"
          class="fixed inset-0 bg-black/40"
          aria-label="Cerrar menú"
          tabindex="-1"
          @click="close"
        />
      </TransitionChild>

      <TransitionChild
        as="template"
        enter="duration-200 ease-out"
        enter-from="-translate-x-full"
        enter-to="translate-x-0"
        leave="duration-150 ease-in"
        leave-from="translate-x-0"
        leave-to="-translate-x-full"
      >
        <aside
          class="fixed inset-y-0 left-0 z-[101] w-72 max-w-[85vw] border-r border-slate-200 bg-white shadow-xl"
          aria-label="Navegación"
        >
          <div class="flex h-16 items-center justify-end border-b border-slate-200 px-4">
            <button
              type="button"
              class="p-2 text-slate-500 transition-colors hover:text-slate-900"
              aria-label="Cerrar menú"
              @click="close"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <nav
            class="flex flex-col gap-0.5 p-4"
            aria-label="Navegación principal"
          >
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="rounded-lg px-4 py-3 text-sm font-medium transition-colors"
              :class="isNavActive(item.path)
                ? 'bg-primary/10 text-primary'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
              @click="close"
            >
              {{ item.label }}
            </router-link>
          </nav>
        </aside>
      </TransitionChild>
    </div>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { TransitionChild, TransitionRoot } from '@headlessui/vue'
import { useRoute } from 'vue-router'

export interface NavItem {
  label: string
  path: string
}

const props = defineProps<{
  modelValue: boolean
  navItems: NavItem[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const route = useRoute()

function isNavActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path === path || route.path.startsWith(path + '/')
}

function close(): void {
  emit('update:modelValue', false)
}
</script>
