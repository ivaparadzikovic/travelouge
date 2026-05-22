import { useEffect } from 'react'
import { useThemeStore } from '../stores/themeStore'

export function useTheme() {
  const { theme, setTheme } = useThemeStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return { theme, setTheme }
}
