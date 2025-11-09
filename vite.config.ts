import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import Components from 'unplugin-vue-components/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    Components({
      resolvers: [PrimeVueResolver()],
    }),
  ],
  server: {
    host: '0.0.0.0',
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: ['care.edspike.com', 'localhost', '127.0.0.1', '172.232.40.44']
  },
  resolve: {
    alias: {
      // "@": fileURLToPath(new URL("./src", import.meta.url)),
      '@/router': fileURLToPath(new URL('./src/router', import.meta.url)),
      '@/stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
      '@/lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
      '@/interfaces': fileURLToPath(new URL('./src/interfaces', import.meta.url)),
      '@/types': fileURLToPath(new URL('./src/types', import.meta.url)),
      '@/assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@/views': fileURLToPath(new URL('./src/views', import.meta.url)),
      '@/constants': fileURLToPath(new URL('./src/constants', import.meta.url)),
      '@/components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@/composables': fileURLToPath(new URL('./src/composables', import.meta.url)),
      '@/schema': fileURLToPath(new URL('./src/schema', import.meta.url)),
      '@/api': fileURLToPath(new URL('./src/api', import.meta.url)),
    },
  },
})
