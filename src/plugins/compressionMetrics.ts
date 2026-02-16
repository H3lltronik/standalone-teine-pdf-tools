import type { App, InjectionKey } from 'vue'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { ICompressionMetricsService } from '../core/metrics/compression-metrics-service'
import { SupabaseCompressionMetricsService } from '../implementations/supabase-compression-metrics'
import { NullCompressionMetricsService } from '../implementations/null-compression-metrics'

export const CompressionMetricsKeys: {
  compressionMetricsService: InjectionKey<ICompressionMetricsService>
} = {
  compressionMetricsService: Symbol(
    'compressionMetricsService'
  ) as InjectionKey<ICompressionMetricsService>,
}

export interface CompressionMetricsPluginOptions {
  supabaseUrl?: string
  supabaseAnonKey?: string
  tableName?: string
}

export function createCompressionMetricsPlugin(
  options: CompressionMetricsPluginOptions = {}
): { install(app: App): void } {
  const { supabaseUrl, supabaseAnonKey, tableName } = options
  const hasConfig =
    typeof supabaseUrl === 'string' &&
    supabaseUrl.trim() !== '' &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.trim() !== ''

  const service: ICompressionMetricsService = hasConfig
    ? (() => {
        const supabase: SupabaseClient = createClient(supabaseUrl.trim(), supabaseAnonKey.trim())
        return new SupabaseCompressionMetricsService(supabase, { tableName })
      })()
    : new NullCompressionMetricsService()

  return {
    install(app: App): void {
      app.provide(CompressionMetricsKeys.compressionMetricsService, service)
    },
  }
}
