import { lazy } from 'react'

const RETRY_KEY = 'lazyWithRetry:lastAttempt'
const RETRY_WINDOW_MS = 30_000

export function lazyWithRetry(factory) {
  return lazy(async () => {
    try {
      const module = await factory()
      sessionStorage.removeItem(RETRY_KEY)
      return module
    } catch (error) {
      const lastAttempt = sessionStorage.getItem(RETRY_KEY)
      const now = Date.now()
      if (!lastAttempt || now - Number(lastAttempt) > RETRY_WINDOW_MS) {
        sessionStorage.setItem(RETRY_KEY, String(now))
        window.location.reload()
        return new Promise(() => {})
      }
      throw error
    }
  })
}
