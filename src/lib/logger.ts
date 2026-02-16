import { getLogger } from '@logtape/logtape'
import type { Logger } from '@logtape/logtape'

const ROOT_CATEGORY = 'teine-app'

/**
 * Get a logger for a subcategory. Use for module-specific logs.
 * @param subcategory - e.g. 'optimizer', 'compression', 'workspace-editor'
 */
export function getLoggerFor(subcategory: string | readonly string[]): Logger {
  const category =
    typeof subcategory === 'string'
      ? [ROOT_CATEGORY, subcategory]
      : [ROOT_CATEGORY, ...subcategory]
  return getLogger(category)
}

/** Root app logger. Use getLoggerFor() when you want a named subcategory. */
export const logger = getLogger([ROOT_CATEGORY])
