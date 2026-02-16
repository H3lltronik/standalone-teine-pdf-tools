import { defineStore } from 'pinia'

export interface WorkspaceTab {
  id: string
  label: string
}

export const useWorkspaceTabsStore = defineStore('workspaceEditorTabs', {
  state: () => ({
    activeTabId: null as string | null,
    tabs: [] as WorkspaceTab[],
  }),

  getters: {
    activeTab(): WorkspaceTab | undefined {
      if (!this.activeTabId) return undefined
      return this.tabs.find((t) => t.id === this.activeTabId)
    },

    activeTabIndex(): number {
      if (!this.activeTabId) return -1
      const i = this.tabs.findIndex((t) => t.id === this.activeTabId)
      return i >= 0 ? i : -1
    },
  },

  actions: {
    setActiveTab(id: string | null): void {
      this.activeTabId = id
    },

    setTabs(tabs: WorkspaceTab[]): void {
      this.tabs = tabs
      if (tabs.length > 0 && !this.activeTabId) {
        this.activeTabId = tabs[0]?.id ?? null
      }
    },

    /** Adds a tab and sets it active. Does not init workspace/annotations; use composable for that. */
    addTab(tab: WorkspaceTab): void {
      this.tabs.push(tab)
      this.activeTabId = tab.id
    },

    /** Removes a tab and adjusts activeTabId. Does not revoke thumbnails or destroy workspace/annotations; use composable for that. */
    removeTab(id: string): void {
      const index = this.tabs.findIndex((t) => t.id === id)
      if (index === -1) return
      this.tabs.splice(index, 1)
      if (this.activeTabId === id) {
        const next = this.tabs[index] ?? this.tabs[index - 1]
        this.activeTabId = next?.id ?? null
      }
    },

    reset(): void {
      this.activeTabId = null
      this.tabs = []
    },
  },
})
