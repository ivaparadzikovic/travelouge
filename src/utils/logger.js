const LEVELS = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 }

function resolveLevel() {
  const env = import.meta.env.VITE_ENV ?? (import.meta.env.DEV ? 'development' : 'production')
  if (env === 'production') return LEVELS.warn
  if (env === 'stage') return LEVELS.info
  return LEVELS.debug
}

const currentLevel = resolveLevel()

function emit(level, method, message, ...optionalParams) {
  if (LEVELS[level] < currentLevel) return
  console[method](message, ...optionalParams)
}

export const logger = {
  debug: (message, ...optionalParams) => emit('debug', 'log', message, ...optionalParams),
  info: (message, ...optionalParams) => emit('info', 'info', message, ...optionalParams),
  warn: (message, ...optionalParams) => emit('warn', 'warn', message, ...optionalParams),
  error: (message, ...optionalParams) => emit('error', 'error', message, ...optionalParams),
}
