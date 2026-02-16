import type { App } from 'vue'
import type { Router } from 'vue-router'
import { initAnalytics, pageView } from '@/lib/analytics'

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined

export function createAnalyticsPlugin(router: Router) {
  return {
    install(_app: App): void {
      initAnalytics(MEASUREMENT_ID).then(() => {
        if (import.meta.env.DEV && MEASUREMENT_ID) {
          console.info('[GA] Google Analytics activo:', MEASUREMENT_ID)
        }
        router.afterEach((to) => {
          const title = to.meta && 'title' in to.meta ? (to.meta as { title?: string }).title : undefined
          pageView(to.path, title ?? document.title)
        })
        const current = router.currentRoute.value
        const currentTitle = current.meta && 'title' in current.meta ? (current.meta as { title?: string }).title : undefined
        pageView(current.path, currentTitle ?? document.title)
      })
    },
  }
}
