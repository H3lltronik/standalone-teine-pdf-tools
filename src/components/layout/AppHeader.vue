<template>
  <header class="sticky top-0 z-50 border-b border-slate-200 bg-white">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center">
        <!-- Hamburger (mobile only) + Logo + App name -->
        <div class="mr-6 flex items-center gap-2 md:mr-10 md:gap-4">
          <button
            type="button"
            class="-ml-2 p-2 text-slate-500 transition-colors hover:text-slate-900 md:hidden"
            aria-label="Abrir menú"
            @click="drawerOpen = true"
          >
            <span class="material-symbols-outlined" aria-hidden="true">menu</span>
          </button>

          <router-link
            to="/"
            class="flex select-none items-center gap-2"
          >
            <div class="flex h-8 w-auto min-w-8 items-center justify-center rounded bg-primary text-white">
              <img
                :src="Logo"
                alt="Teine Logo"
                width="303"
                height="281"
                decoding="async"
                class="h-8 w-auto object-contain"
              />
            </div>
            <span class="whitespace-nowrap text-sm font-bold uppercase tracking-tight text-slate-900">
              {{ appName }}
            </span>
          </router-link>
        </div>

        <!-- Main nav: full-height items with bottom border on active -->
        <nav
          class="hidden h-full md:flex"
          aria-label="Main navigation"
        >
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="inline-flex h-full items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors md:px-4"
            :class="isNavActive(item.path)
              ? 'border-primary text-slate-900'
              : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'"
          >
            {{ item.label }}
          </router-link>
        </nav>

        <!-- Breadcrumb (optional), only when no main nav emphasis -->
        <nav
          v-if="breadcrumbs.length > 0"
          class="ml-8 flex min-w-0 flex-1 items-center gap-1.5 text-sm text-slate-600"
          aria-label="Breadcrumb"
        >
          <template
            v-for="(crumb, i) in breadcrumbs"
            :key="i"
          >
            <span
              v-if="i > 0"
              class="shrink-0 text-slate-400"
              aria-hidden="true"
            >
              <span class="material-symbols-outlined text-[18px]" aria-hidden="true">chevron_right</span>
            </span>
            <router-link
              v-if="crumb.to"
              :to="crumb.to"
              class="truncate font-medium transition-colors hover:text-slate-900"
            >
              {{ crumb.label }}
            </router-link>
            <span
              v-else
              class="truncate font-medium text-slate-900"
            >
              {{ crumb.label }}
            </span>
          </template>
        </nav>

      </div>
    </div>
    <AsideDrawer
      v-model="drawerOpen"
      :nav-items="navItems"
    />
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import AsideDrawer from './AsideDrawer.vue'
import Logo from '../../assets/teine_logo.webp'

const drawerOpen = ref(false)

export interface BreadcrumbItem {
  label: string
  to?: string
}

export interface NavItem {
  label: string
  path: string
}

const navItems: NavItem[] = [
  { label: 'Inicio', path: '/' },
  { label: 'Editor', path: '/workspaces/editor' },
  { label: 'Optimizador', path: '/compression' },
]

const route = useRoute()

function isNavActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path === path || route.path.startsWith(path + '/')
}

withDefaults(
  defineProps<{
    appName?: string
    breadcrumbs?: BreadcrumbItem[]
  }>(),
  {
    appName: 'Teine',
    breadcrumbs: () => [],
  }
)

</script>
