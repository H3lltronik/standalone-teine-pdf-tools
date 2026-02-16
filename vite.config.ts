import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true, // listen on 0.0.0.0 so both IPv4 (127.0.0.1) and IPv6 (::1) work
  },
  plugins: [
    vue(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks(id: string): string | undefined {
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
              return 'vue-vendor'
            }
            if (
              id.includes('pdfjs-dist') ||
              id.includes('jspdf') ||
              id.includes('@quicktoolsone/pdf-compress') ||
              id.includes('browser-image-compression')
            ) {
              return 'pdf-vendor'
            }
            if (id.includes('@supabase/supabase-js')) {
              return 'supabase'
            }
          }
          return undefined
        },
      },
    },
  },
})
