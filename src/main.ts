import { createApp, defineAsyncComponent } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import { Noir } from '../primevue.config.ts'
import '../styles.css'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { ToastService } from 'primevue'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

export const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.component("app-table", defineAsyncComponent(() => import("@/components/shared/AppTable.vue")))

app.use(VueQueryPlugin, {
  enableDevtoolsV6Plugin: true,
})
app.use(pinia)
app.use(router)
app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: Noir,
    options: {
      darkModeSelector: false,
    },
  },
})
app.use(ToastService)

// Initialize authentication state after mounting
app.mount('#app')

// Initialize auth store after app is mounted
const authStore = useAuthStore()
authStore.initializeAuth()
