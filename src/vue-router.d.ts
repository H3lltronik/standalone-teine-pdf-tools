export {}

declare module 'vue-router' {
  interface RouteMeta {
    breadcrumbs?: Array<{ label: string; to?: string }>
  }
}
