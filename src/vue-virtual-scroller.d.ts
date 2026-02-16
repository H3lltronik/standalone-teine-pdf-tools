declare module 'vue-virtual-scroller' {
  import type { Plugin, Component } from 'vue'
  export const RecycleScroller: Component
  export const DynamicScroller: Component
  export const DynamicScrollerItem: Component
  export const IdState: unknown
  const plugin: Plugin
  export default plugin
}
