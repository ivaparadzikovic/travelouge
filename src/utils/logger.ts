const LEVELS = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 } as const

type Level = keyof typeof LEVELS
type ConsoleMethod = 'log' | 'info' | 'warn' | 'error'

function resolveLevel(): number {
  const env = import.meta.env.VITE_ENV ?? (import.meta.env.DEV ? 'development' : 'production')
  if (env === 'production') return LEVELS.warn
  if (env === 'stage') return LEVELS.info
  return LEVELS.debug
}

const currentLevel = resolveLevel()

function emit(level: Level, method: ConsoleMethod, message?: unknown, ...optionalParams: unknown[]) {
  if (LEVELS[level] < currentLevel) return
  console[method](message, ...optionalParams)
}

export const logger = {
  debug: (message?: unknown, ...optionalParams: unknown[]) => emit('debug', 'log', message, ...optionalParams),
  info: (message?: unknown, ...optionalParams: unknown[]) => emit('info', 'info', message, ...optionalParams),
  warn: (message?: unknown, ...optionalParams: unknown[]) => emit('warn', 'warn', message, ...optionalParams),
  error: (message?: unknown, ...optionalParams: unknown[]) => emit('error', 'error', message, ...optionalParams),
}
