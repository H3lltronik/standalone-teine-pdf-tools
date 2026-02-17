import './setup-logger'
import './config/pdf-worker'
import { createApp } from 'vue'
import { createHead } from '@unhead/vue/client'
import { createPinia } from 'pinia'
import './style.css'
import 'v-tour-guide/style.css'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import App from './App.vue'
import router from './router'
import { createAnalyticsPlugin } from './plugins/analytics'
import { createCompressionMetricsPlugin } from './plugins/compressionMetrics'
import { createAdSensePlugin } from './plugins/adsense'

const app = createApp(App)
const head = createHead()

app.use(createPinia())
app.use(router)
app.use(head)

let pdfOptimizerPluginInstalled = false
router.beforeEach(async (to, _from, next) => {
  if (to.name === 'compression' && !pdfOptimizerPluginInstalled) {
    const { createPdfOptimizerPlugin } = await import('./plugins/pdfOptimizer')
    app.use(createPdfOptimizerPlugin())
    pdfOptimizerPluginInstalled = true
  }
  next()
})

app.use(VueVirtualScroller)
app.use(createAnalyticsPlugin(router))
app.use(
  createCompressionMetricsPlugin({
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string | undefined,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
    tableName: 'compression_metrics',
  })
)
app.use(createAdSensePlugin())
app.mount('#app')
