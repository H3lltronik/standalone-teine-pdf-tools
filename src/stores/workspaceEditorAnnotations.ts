import { defineStore } from 'pinia'
import type { PdfAnnotation, SelectedAnnotation } from '../types/workspace-editor'
import { createDefaultWorkspaceAnnotationsState } from '../types/workspace-editor'
import { useWorkspaceTabsStore } from './workspaceEditorTabs'
import { useWorkspaceEditorWorkspaceStore } from './workspaceEditorWorkspace'

export const useWorkspaceEditorAnnotationsStore = defineStore('workspaceEditorAnnotations', {
  state: () => ({
    byTab: {} as Record<string, ReturnType<typeof createDefaultWorkspaceAnnotationsState>>,
    /** When true, the annotation layer must not create a new annotation on the next mousedown (e.g. click was on context menu). */
    contextMenuWasOpen: false,
  }),

  getters: {
    annotationsByPage(): PdfAnnotation[][] {
      const tabsStore = useWorkspaceTabsStore()
      if (!tabsStore.activeTabId) return []
      const state = this.byTab[tabsStore.activeTabId]
      return state?.annotationsByPage ?? []
    },

    selectedAnnotation(): SelectedAnnotation | null {
      const tabsStore = useWorkspaceTabsStore()
      if (!tabsStore.activeTabId) return null
      const state = this.byTab[tabsStore.activeTabId]
      return state?.selectedAnnotation ?? null
    },

    annotationsForPage(): (pageIndex: number) => PdfAnnotation[] {
      return (pageIndex: number) => this.annotationsByPage[pageIndex] ?? []
    },

    isAnnotationSelected(): (pageIndex: number, annotationIndex: number) => boolean {
      return (pageIndex: number, annotationIndex: number) =>
        this.selectedAnnotation !== null &&
        this.selectedAnnotation.pageIndex === pageIndex &&
        this.selectedAnnotation.annotationIndex === annotationIndex
    },
  },

  actions: {
    initForTab(tabId: string): void {
      this.byTab[tabId] = createDefaultWorkspaceAnnotationsState()
    },

    destroyForTab(tabId: string): void {
      delete this.byTab[tabId]
    },

    addAnnotation(pageIndex: number, annotation: PdfAnnotation): void {
      const tabsStore = useWorkspaceTabsStore()
      const tabId = tabsStore.activeTabId
      if (!tabId) return
      const state = this.byTab[tabId]
      if (!state) return
      const updatedAnnotations = [...state.annotationsByPage]
      const currentPageAnnotations = updatedAnnotations[pageIndex] ?? []
      updatedAnnotations[pageIndex] = [...currentPageAnnotations, annotation]
      state.annotationsByPage = updatedAnnotations
    },

    setContextMenuWasOpen(value: boolean): void {
      this.contextMenuWasOpen = value
    },

    setSelectedAnnotation(selection: SelectedAnnotation | null): void {
      const tabsStore = useWorkspaceTabsStore()
      const tabId = tabsStore.activeTabId
      if (!tabId) return
      const state = this.byTab[tabId]
      if (!state) return
      state.selectedAnnotation = selection
    },

    updateAnnotation(
      pageIndex: number,
      annotationIndex: number,
      updates: Partial<PdfAnnotation>
    ): void {
      const tabsStore = useWorkspaceTabsStore()
      const tabId = tabsStore.activeTabId
      if (!tabId) return
      const state = this.byTab[tabId]
      if (!state) return
      const list = state.annotationsByPage[pageIndex] ?? []
      if (annotationIndex < 0 || annotationIndex >= list.length) return
      const next = [...state.annotationsByPage]
      const page = [...list]
      const current = page[annotationIndex]
      if (!current) return
      page[annotationIndex] = { ...current, ...updates } as PdfAnnotation
      next[pageIndex] = page
      state.annotationsByPage = next
    },

    removeAnnotation(pageIndex: number, annotationIndex: number): void {
      const tabsStore = useWorkspaceTabsStore()
      const tabId = tabsStore.activeTabId
      if (!tabId) return
      const state = this.byTab[tabId]
      if (!state) return
      const list = state.annotationsByPage[pageIndex] ?? []
      if (annotationIndex < 0 || annotationIndex >= list.length) return
      const next = [...state.annotationsByPage]
      const page = list.filter((_, i) => i !== annotationIndex)
      next[pageIndex] = page
      state.annotationsByPage = next
      if (
        state.selectedAnnotation?.pageIndex === pageIndex &&
        state.selectedAnnotation?.annotationIndex === annotationIndex
      ) {
        state.selectedAnnotation = null
      } else if (
        state.selectedAnnotation?.pageIndex === pageIndex &&
        state.selectedAnnotation &&
        state.selectedAnnotation.annotationIndex > annotationIndex
      ) {
        state.selectedAnnotation = {
          ...state.selectedAnnotation,
          annotationIndex: state.selectedAnnotation.annotationIndex - 1,
        }
      }
    },

    reset(): void {
      this.byTab = {}
    },

    resetCanvasForActive(): void {
      const tabsStore = useWorkspaceTabsStore()
      const tabId = tabsStore.activeTabId
      if (!tabId) return
      const state = this.byTab[tabId]
      if (!state) return
      state.annotationsByPage = []
      state.selectedAnnotation = null
    },

    /**
     * Ensures annotationsByPage has at least totalPages rows (pads with []).
     * Call when workspace adds a blank page so the new page has an empty annotations array.
     */
    ensurePageCount(totalPages: number): void {
      const tabsStore = useWorkspaceTabsStore()
      const tabId = tabsStore.activeTabId
      if (!tabId || totalPages <= 0) return
      const state = this.byTab[tabId]
      if (!state) return
      const current = state.annotationsByPage
      if (current.length >= totalPages) return
      const next = [...current]
      while (next.length < totalPages) next.push([])
      state.annotationsByPage = next
    },

    /**
     * Reorder annotation rows by display index (same as workspace page order).
     * fromIndex, toIndex are 0-based display positions (PDF pages only).
     * Ensures annotationsByPage has numPages rows (pads with []) so reorder always applies.
     */
    reorderAnnotationPages(fromIndex: number, toIndex: number): void {
      const tabsStore = useWorkspaceTabsStore()
      const workspaceStore = useWorkspaceEditorWorkspaceStore()
      const tabId = tabsStore.activeTabId
      if (!tabId || fromIndex === toIndex) return
      const state = this.byTab[tabId]
      if (!state) return
      const totalPages = workspaceStore.totalNumPages
      if (totalPages <= 0 || fromIndex < 0 || fromIndex >= totalPages || toIndex < 0 || toIndex >= totalPages) return
      const current = state.annotationsByPage
      const pages: PdfAnnotation[][] = Array.from({ length: totalPages }, (_, i) => current[i] ?? [])
      const [removed] = pages.splice(fromIndex, 1)
      pages.splice(toIndex, 0, removed ?? [])
      state.annotationsByPage = pages
      const sel = state.selectedAnnotation
      if (!sel) return
      const mapDisplayIndex = (i: number): number => {
        if (i === fromIndex) return toIndex
        if (fromIndex < toIndex && i > fromIndex && i <= toIndex) return i - 1
        if (toIndex < fromIndex && i >= toIndex && i < fromIndex) return i + 1
        return i
      }
      state.selectedAnnotation = {
        pageIndex: mapDisplayIndex(sel.pageIndex),
        annotationIndex: sel.annotationIndex,
      }
    },
  },
})
