/**
 * LogTape is configured only in development.
 * In production no sinks are registered, so logging has zero overhead.
 */
import { configureSync, getConsoleSink } from '@logtape/logtape'

if (import.meta.env.DEV) {
  configureSync({
    sinks: { console: getConsoleSink() },
    loggers: [
      {
        category: 'teine-app',
        lowestLevel: 'debug',
        sinks: ['console'],
      },
    ],
  })
}
