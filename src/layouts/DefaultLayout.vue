<template>
  <div class="flex h-screen min-h-0 flex-col overflow-hidden bg-linear-to-br from-slate-50 via-blue-50 to-slate-100">
    <AppHeader :breadcrumbs="breadcrumbs" />
<main class="min-h-0 flex-1 overflow-y-auto">
      <router-view v-slot="{ Component, route: currentRoute }">
        <TransitionRoot
          :show="transitionVisible"
          appear
          unmount
          enter="transition ease-out duration-200"
          enter-from="opacity-0 translate-y-2"
          enter-to="opacity-100 translate-y-0"
          entered=""
          leave="transition ease-in duration-150"
          leave-from="opacity-100 translate-y-0"
          leave-to="opacity-0 -translate-y-2"
          @after-leave="onAfterLeave"
        >
          <TransitionChild
            as="div"
            unmount
            enter="transition ease-out duration-200"
            enter-from="opacity-0 translate-y-2"
            enter-to="opacity-100 translate-y-0"
            entered=""
            leave="transition ease-in duration-150"
            leave-from="opacity-100 translate-y-0"
            leave-to="opacity-0 -translate-y-2"
          >
            <component
              :is="displayComponent ?? Component"
              :key="displayKey ?? currentRoute.path"
            />
          </TransitionChild>
        </TransitionRoot>
      </router-view>
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import type { ShallowRef } from 'vue'
import { useRoute } from 'vue-router'
import { TransitionChild, TransitionRoot } from '@headlessui/vue'
import type { Component } from 'vue'
import AppFooter from '../components/layout/AppFooter.vue'
import AppHeader from '../components/layout/AppHeader.vue'
import type { BreadcrumbItem } from '../components/layout/AppHeader.vue'

const route = useRoute()

const breadcrumbs = computed<BreadcrumbItem[]>(
  () => (route.meta.breadcrumbs as BreadcrumbItem[] | undefined) ?? []
)

const currentRouteComponent = computed<Component | null>(() => {
  const lastMatch = route.matched[route.matched.length - 1]
  const comp = lastMatch?.components?.default
  return (comp as Component) ?? null
})

const transitionVisible = ref(true)
const displayComponent: ShallowRef<Component | null> = shallowRef(null)
const displayKey = ref('')
const pendingComponent: ShallowRef<Component | null> = shallowRef(null)
const pendingKey = ref('')

function onAfterLeave(): void {
  if (pendingComponent.value !== null && pendingKey.value !== '') {
    displayComponent.value = pendingComponent.value
    displayKey.value = pendingKey.value
    pendingComponent.value = null
    pendingKey.value = ''
  }
  nextTick(() => {
    transitionVisible.value = true
  })
}

watch(
  () => ({ path: route.path, component: currentRouteComponent.value }),
  ({ path, component }) => {
    if (component === null) return
    if (displayComponent.value === null) {
      displayComponent.value = component
      displayKey.value = path
      return
    }
    pendingComponent.value = component
    pendingKey.value = path
    transitionVisible.value = false
  },
  { immediate: true }
)
</script>
