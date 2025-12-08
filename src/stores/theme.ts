import { defineStore } from 'pinia'

type ThemeMode = 'light' | 'dark'

const THEME_LIGHT_CLASS = 'theme-light'
const THEME_DARK_CLASS = 'theme-dark'
const THEME_STORAGE_KEY = 'app-theme'

const applyThemeToDocument = (mode: ThemeMode) => {
  if (typeof document === 'undefined') {
    return
  }
  const root = document.documentElement

  root.classList.remove(THEME_LIGHT_CLASS, THEME_DARK_CLASS)
  root.classList.add(mode === 'dark' ? THEME_DARK_CLASS : THEME_LIGHT_CLASS)
  root.setAttribute('data-theme', mode)
  root.style.colorScheme = mode
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    currentTheme: 'light' as ThemeMode
  }),
  actions: {
    setTheme(mode: ThemeMode) {
      this.currentTheme = mode
      applyThemeToDocument(mode)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(THEME_STORAGE_KEY, mode)
      }
    },
    toggleTheme() {
      this.setTheme(this.currentTheme === 'dark' ? 'light' : 'dark')
    },
    initializeTheme() {
      if (typeof window === 'undefined') {
        return
      }

      const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null
      if (storedTheme === 'light' || storedTheme === 'dark') {
        this.currentTheme = storedTheme
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        this.currentTheme = prefersDark ? 'dark' : 'light'
      }

      applyThemeToDocument(this.currentTheme)
    }
  }
})
