import './setup-logger'
import { createApp } from 'vue'
import { createHead } from '@unhead/vue/client'
import { createPinia } from 'pinia'
import './style.css'
import 'v-tour-guide/style.css'
import App from './App.vue'
import router from './router'
import { createAnalyticsPlugin } from './plugins/analytics'
import { createAdSensePlugin } from './plugins/adsense'

const app = createApp(App)
const head = createHead()

app.use(createPinia())
app.use(router)
app.use(head)

let pdfWorkerLoaded = false
let compressionPluginsInstalled = false

router.beforeEach(async (to, _from, next) => {
  const routeName = to.name

  // PDF.js worker required for compression and editor only (keeps ~640 KiB off initial load)
  if ((routeName === 'compression' || routeName === 'workspace-editor') && !pdfWorkerLoaded) {
    await import('./config/pdf-worker')
    pdfWorkerLoaded = true
  }

  // Heavy compression-only deps: metrics (Supabase), virtual scroller, pdf optimizer
  if (routeName === 'compression' && !compressionPluginsInstalled) {
    const [
      { createCompressionMetricsPlugin },
      vueVirtualScrollerMod,
      { createPdfOptimizerPlugin },
    ] = await Promise.all([
      import('./plugins/compressionMetrics'),
      Promise.all([
        import('vue-virtual-scroller'),
        import('vue-virtual-scroller/dist/vue-virtual-scroller.css'),
      ]).then(([m]) => m),
      import('./plugins/pdfOptimizer'),
    ])
    const VueVirtualScroller = vueVirtualScrollerMod.default
    app.use(
      createCompressionMetricsPlugin({
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string | undefined,
        supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
        tableName: 'compression_metrics',
      })
    )
    app.use(VueVirtualScroller)
    app.use(createPdfOptimizerPlugin())
    compressionPluginsInstalled = true
  }

  next()
})

app.use(createAnalyticsPlugin(router))
app.use(createAdSensePlugin())
app.mount('#app')
