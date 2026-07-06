import { create } from 'zustand'
import { readStoredTheme, writeStoredTheme, type Theme } from './themeStorage'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

function applyTheme(theme: Theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }
}

const initialTheme = readStoredTheme()
applyTheme(initialTheme)

export const useThemeStore = create<ThemeState>()((set) => ({
  theme: initialTheme,
  setTheme: (theme) => set({ theme }),
}))

useThemeStore.subscribe((state) => {
  writeStoredTheme(state.theme)
  applyTheme(state.theme)
})
