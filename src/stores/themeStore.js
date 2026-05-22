import { create } from 'zustand'

function initialTheme() {
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  const initial = prefersDark ? 'dark' : 'light'
  localStorage.setItem('theme', initial)
  return initial
}

export const useThemeStore = create((set) => ({
  // 'light' | 'dark'
  theme: initialTheme(),
  setTheme: (theme) => {
    localStorage.setItem('theme', theme)
    set({ theme })
  },
}))
