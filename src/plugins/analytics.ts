import type { App } from 'vue'
import type { Router } from 'vue-router'
import { initAnalytics, pageView } from '@/lib/analytics'

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined

export function createAnalyticsPlugin(router: Router) {
  return {
    install(_app: App): void {
      if (!MEASUREMENT_ID?.trim()) {
        console.warn(
          '[GA] Analytics desactivado: VITE_GA_MEASUREMENT_ID no está definido. En producción, configúralo en las variables de entorno del despliegue.'
        )
      }
      initAnalytics(MEASUREMENT_ID).then(() => {
        if (MEASUREMENT_ID && import.meta.env.DEV) {
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
