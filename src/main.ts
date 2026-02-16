import './setup-logger'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import 'v-tour-guide/style.css'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import App from './App.vue'
import router from './router'
import { createPdfOptimizerPlugin } from './plugins/pdfOptimizer'
import { createAnalyticsPlugin } from './plugins/analytics'
import { createCompressionMetricsPlugin } from './plugins/compressionMetrics'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(VueVirtualScroller)
app.use(createPdfOptimizerPlugin())
app.use(createAnalyticsPlugin(router))
app.use(
  createCompressionMetricsPlugin({
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string | undefined,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
    tableName: 'compression_metrics',
  })
)
app.mount('#app')
