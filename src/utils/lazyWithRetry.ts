import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

const RETRY_KEY = 'lazyWithRetry:lastAttempt'
const RETRY_WINDOW_MS = 30_000

// ComponentType<any> is the idiomatic bound for a component-agnostic lazy HOC:
// the wrapper must accept a component of any prop shape.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
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
        return new Promise<{ default: T }>(() => {})
      }
      throw error
    }
  })
}
