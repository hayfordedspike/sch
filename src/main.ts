import { createApp, defineAsyncComponent } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import { Noir } from '../primevue.config.ts'
import '../styles.css'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { ToastService, ConfirmationService } from 'primevue'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'

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
      darkModeSelector: 'html.theme-dark',
    },
  },
})
app.use(ToastService)
app.use(ConfirmationService)

const themeStore = useThemeStore(pinia)
themeStore.initializeTheme()

// Initialize authentication state after mounting
app.mount('#app')

// Initialize auth store after app is mounted with proper async handling
const initializeApp = async () => {
  const authStore = useAuthStore()
  try {
    await authStore.initializeAuth()
    console.log('Auth initialization completed')
  } catch (error) {
    console.error('Auth initialization failed:', error)
  }
}

// Initialize app
initializeApp()
