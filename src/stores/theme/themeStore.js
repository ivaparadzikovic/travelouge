import { create } from 'zustand'
import { readStoredTheme, writeStoredTheme } from './themeStorage'

function applyTheme(theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }
}

const initialTheme = readStoredTheme()
applyTheme(initialTheme)

export const useThemeStore = create((set) => ({
  theme: initialTheme,
  setTheme: (theme) => set({ theme }),
}))

useThemeStore.subscribe((state) => {
  writeStoredTheme(state.theme)
  applyTheme(state.theme)
})
