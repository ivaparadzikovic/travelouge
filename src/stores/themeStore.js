import { create } from 'zustand'

export const useThemeStore = create((set) => ({
  // 'light' | 'dark' | 'system'
  theme: localStorage.getItem('theme') || 'system',
  setTheme: (theme) => {
    localStorage.setItem('theme', theme)
    set({ theme })
  },
}))
