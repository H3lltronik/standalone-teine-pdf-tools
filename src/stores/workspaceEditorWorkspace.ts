import { defineStore } from 'pinia'
import {
  EditorTool,
  type WorkspaceDocState,
  type AddedPage,
  type DisplaySlot,
  type PageRotation,
  ADDED_PAGE_PRESET_MM,
  DEFAULT_PDF_SCALE,
  getEffectiveDisplaySlots,
  getTotalNumPages,
  MIN_PDF_SCALE,
  MAX_PDF_SCALE,
  PDF_SCALE_STEP,
  createDefaultWorkspaceDocState,
} from '../types/workspace-editor'
import type { AddPageConfirmPayload } from '../components/workspace-editor/types'
import { FileSourceType } from '../components/types/compression'
import { pdfService } from '../lib/services/pdf-service'
import { useWorkspaceTabsStore } from './workspaceEditorTabs'
import { useWorkspaceEditorAnnotationsStore } from './workspaceEditorAnnotations'
import { getLoggerFor } from '../lib/logger'

const log = getLoggerFor(['workspace-editor', 'workspace'])

export const useWorkspaceEditorWorkspaceStore = defineStore('workspaceEditorWorkspace', {
  state: () => ({
    workspaces: {} as Record<string, WorkspaceDocState>,
  }),

  getters: {
    activeWorkspace(): WorkspaceDocState | undefined {
      const tabsStore = useWorkspaceTabsStore()
      if (!tabsStore.activeTabId) return undefined
      return this.workspaces[tabsStore.activeTabId]
    },

    pdfSrc(): string {
      return this.activeWorkspace?.pdfSrc ?? ''
    },

    scale(): number {
      return this.activeWorkspace?.scale ?? DEFAULT_PDF_SCALE
    },

    activeTool(): EditorTool {
      return this.activeWorkspace?.activeTool ?? EditorTool.None
    },

    pageRotations(): number[] {
      return this.activeWorkspace?.pageRotations ?? []
    },

    /** Total display pages (PDF + added blank). */
    totalNumPages(): number {
      const ws = this.activeWorkspace
      return ws ? getTotalNumPages(ws) : 0
    },

    /** Display order: orderedPageIndices[displayIndex] = pdf page index. Identity if not set. Only for PDF pages. */
    orderedPageIndices(): number[] {
      const ws = this.activeWorkspace
      const n = ws?.numPages ?? 0
      if (n <= 0) return []
      const order = ws?.pageOrder
      if (order?.length === n) return order
      return Array.from({ length: n }, (_, i) => i)
    },

    /** Unified display order (PDF + added). Used for reordering and for building the pages list. */
    effectiveDisplaySlots(): DisplaySlot[] {
      const ws = this.activeWorkspace
      return ws ? getEffectiveDisplaySlots(ws) : []
    },

    addedPages(): AddedPage[] {
      return this.activeWorkspace?.addedPages ?? []
    },
  },

  actions: {
    initWorkspace(tabId: string, pdfSrc: string): void {
      this.workspaces[tabId] = createDefaultWorkspaceDocState(pdfSrc)
    },

    destroyWorkspace(tabId: string): void {
      const ws = this.workspaces[tabId]
      if (ws) {
        for (const url of ws.pageThumbnailUrls) {
          if (url) pdfService.revokePreviewUrl(url)
        }
      }
      delete this.workspaces[tabId]
    },

    setPdfSrc(src: string): void {
      const ws = this.activeWorkspace
      if (!ws) return
      ws.pdfSrc = src
    },

    setScale(scale: number): void {
      const ws = this.activeWorkspace
      if (!ws) return
      ws.scale = Math.max(MIN_PDF_SCALE, Math.min(MAX_PDF_SCALE, scale))
    },

    zoomIn(): void {
      const ws = this.activeWorkspace
      if (!ws) return
      this.setScale(ws.scale + PDF_SCALE_STEP)
    },

    zoomOut(): void {
      const ws = this.activeWorkspace
      if (!ws) return
      this.setScale(ws.scale - PDF_SCALE_STEP)
    },

    setActiveTool(tool: EditorTool): void {
      const ws = this.activeWorkspace
      if (!ws) return
      ws.activeTool = ws.activeTool === tool ? EditorTool.None : tool
    },

    setNumPages(numPages: number): void {
      const ws = this.activeWorkspace
      if (!ws) return
      const prevNumPages = ws.numPages
      const addedCount = ws.addedPages.length
      if (prevNumPages !== numPages) {
        for (let i = 0; i < ws.pageThumbnailUrls.length; i++) {
          if (i < numPages && ws.pageThumbnailUrls[i]) {
            pdfService.revokePreviewUrl(ws.pageThumbnailUrls[i]!)
          }
        }
        const pdfThumbnails = Array.from({ length: numPages }, () => null as string | null)
        const existingAddedThumbnails = ws.pageThumbnailUrls.slice(prevNumPages, prevNumPages + addedCount)
        while (existingAddedThumbnails.length < addedCount) existingAddedThumbnails.push(null)
        ws.pageThumbnailUrls = [...pdfThumbnails, ...existingAddedThumbnails]
        const total = numPages + addedCount
        ws.selectedPageIndices = ws.selectedPageIndices.filter((i) => i < total)
        const pdfRotations = [...ws.pageRotations.slice(0, numPages)]
        while (pdfRotations.length < numPages) pdfRotations.push(0)
        const addedRotations = ws.pageRotations.slice(numPages, prevNumPages + addedCount)
        while (addedRotations.length < addedCount) addedRotations.push(0)
        ws.pageRotations = [...pdfRotations, ...addedRotations]
        ws.pageOrder = Array.from({ length: numPages }, (_, i) => i)
        ws.displaySlots = undefined
      }
      ws.numPages = numPages
      useWorkspaceEditorAnnotationsStore().ensurePageCount(getTotalNumPages(ws))
    },

    setPageThumbnailUrl(pageIndex: number, url: string | null): void {
      const ws = this.activeWorkspace
      if (!ws) return
      while (ws.pageThumbnailUrls.length <= pageIndex) {
        ws.pageThumbnailUrls.push(null)
      }
      const prev = ws.pageThumbnailUrls[pageIndex]
      if (prev) pdfService.revokePreviewUrl(prev)
      ws.pageThumbnailUrls[pageIndex] = url
    },

    /**
     * Generates thumbnails for the active workspace once (when PDF is loaded).
     * Idempotent: skips if thumbnails already exist for current numPages.
     */
    async generateThumbnailsForActiveWorkspace(): Promise<void> {
      const tabsStore = useWorkspaceTabsStore()
      const ws = this.activeWorkspace
      if (!ws?.pdfSrc || ws.numPages <= 0) return
      const urls = ws.pageThumbnailUrls
      if (urls.length === ws.numPages && urls.some((u) => u != null)) return
      const tabId = tabsStore.activeTabId
      const urlsGenerated = await pdfService.generatePageThumbnailUrls(
        { type: FileSourceType.Remote, url: ws.pdfSrc },
        ws.numPages
      )
      if (tabsStore.activeTabId !== tabId) {
        for (const u of urlsGenerated) {
          if (u) pdfService.revokePreviewUrl(u)
        }
        return
      }
      for (let i = 0; i < urlsGenerated.length; i++) {
        const u = urlsGenerated[i]
        if (u != null) this.setPageThumbnailUrl(i, u)
      }
    },

    setCurrentPageIndex(index: number): void {
      const ws = this.activeWorkspace
      if (!ws) return
      const total = getTotalNumPages(ws)
      ws.currentPageIndex = Math.max(0, Math.min(index, total - 1))
    },

    togglePageSelection(pageIndex: number): void {
      const ws = this.activeWorkspace
      if (!ws) return
      const total = getTotalNumPages(ws)
      if (pageIndex < 0 || pageIndex >= total) return
      const set = new Set(ws.selectedPageIndices)
      if (set.has(pageIndex)) set.delete(pageIndex)
      else set.add(pageIndex)
      ws.selectedPageIndices = Array.from(set).sort((a, b) => a - b)
    },

    rotatePage(pageIndex: number): void {
      const ws = this.activeWorkspace
      if (!ws) return
      const total = getTotalNumPages(ws)
      if (pageIndex < 0 || pageIndex >= total) return
      const rotations = [...ws.pageRotations]
      while (rotations.length <= pageIndex) rotations.push(0)
      const next: PageRotation = ((rotations[pageIndex] ?? 0) + 90) % 360 as PageRotation
      rotations[pageIndex] = next
      ws.pageRotations = rotations
    },

    /**
     * Adds a blank page with the given dimensions. Appended after PDF pages.
     * Also extends pageRotations and pageThumbnailUrls; caller should ensure annotations store has a slot (ensurePageCount).
     */
    addBlankPage(payload: AddPageConfirmPayload): void {
      const ws = this.activeWorkspace
      if (!ws) return
      let widthMm: number
      let heightMm: number
      if (payload.preset === 'carta') {
        widthMm = ADDED_PAGE_PRESET_MM.carta.widthMm
        heightMm = ADDED_PAGE_PRESET_MM.carta.heightMm
      } else if (payload.preset === 'oficio') {
        widthMm = ADDED_PAGE_PRESET_MM.oficio.widthMm
        heightMm = ADDED_PAGE_PRESET_MM.oficio.heightMm
      } else {
        const w = payload.widthMm ?? 210
        const h = payload.heightMm ?? 297
        widthMm = Number.isFinite(w) ? w : 210
        heightMm = Number.isFinite(h) ? h : 297
      }
      const added: AddedPage = {
        id: crypto.randomUUID(),
        widthMm,
        heightMm,
      }
      ws.addedPages.push(added)
      ws.pageRotations.push(0)
      ws.pageThumbnailUrls.push(null)
      if (ws.displaySlots != null) {
        ws.displaySlots = [...ws.displaySlots, { type: 'added', id: added.id }]
      }
      useWorkspaceEditorAnnotationsStore().ensurePageCount(getTotalNumPages(ws))
    },

    reset(): void {
      const tabIds = Object.keys(this.workspaces)
      for (const tabId of tabIds) {
        this.destroyWorkspace(tabId)
      }
      this.workspaces = {}
    },

    resetCanvasForActive(): void {
      const ws = this.activeWorkspace
      if (!ws) return
      ws.scale = DEFAULT_PDF_SCALE
      ws.activeTool = EditorTool.None
    },

    /**
     * Reorder pages by display index. fromIndex and toIndex are 0-based display positions (any slot: PDF or added).
     * Caller must also reorder annotations (annotations store) and trigger PDF re-render.
     */
    reorderPages(fromIndex: number, toIndex: number): void {
      const ws = this.activeWorkspace
      if (!ws || fromIndex === toIndex) {
        log.info(`Reorder pages from ${fromIndex} to ${toIndex} skipped: no workspace or fromIndex === toIndex`)
        return
      }
      const total = getTotalNumPages(ws)
      if (fromIndex < 0 || fromIndex >= total || toIndex < 0 || toIndex >= total) {
        log.info(`Reorder pages from ${fromIndex} to ${toIndex} skipped: invalid indices (total=${total})`)
        return
      }
      const slots = getEffectiveDisplaySlots(ws)
      const rotations = [...(ws.pageRotations?.length === total ? ws.pageRotations : Array.from({ length: total }, () => 0))]
      const thumbnails = [...(ws.pageThumbnailUrls?.length === total ? ws.pageThumbnailUrls : Array.from({ length: total }, () => null))]

      const [removedSlot] = slots.splice(fromIndex, 1)
      slots.splice(toIndex, 0, removedSlot ?? { type: 'pdf', pdfIndex: 0 })
      const [removedRot] = rotations.splice(fromIndex, 1)
      rotations.splice(toIndex, 0, removedRot ?? 0)
      const [removedThumb] = thumbnails.splice(fromIndex, 1)
      thumbnails.splice(toIndex, 0, removedThumb ?? null)

      ws.displaySlots = slots
      ws.pageRotations = rotations
      ws.pageThumbnailUrls = thumbnails

      ws.pageOrder = slots.filter((s): s is { type: 'pdf'; pdfIndex: number } => s.type === 'pdf').map((s) => s.pdfIndex)
      const addedById = new Map(ws.addedPages.map((a) => [a.id, a]))
      ws.addedPages = slots
        .filter((s): s is { type: 'added'; id: string } => s.type === 'added')
        .map((s) => addedById.get(s.id))
        .filter((a): a is AddedPage => a != null)

      const current = ws.currentPageIndex
      const newCurrent =
        current === fromIndex ? toIndex : current === toIndex ? (toIndex > fromIndex ? current - 1 : current + 1) : current
      ws.currentPageIndex = Math.max(0, Math.min(newCurrent, total - 1))
      const mapDisplayIndex = (i: number): number => {
        if (i === fromIndex) return toIndex
        if (fromIndex < toIndex && i > fromIndex && i <= toIndex) return i - 1
        if (toIndex < fromIndex && i >= toIndex && i < fromIndex) return i + 1
        return i
      }
      const selected = ws.selectedPageIndices.map(mapDisplayIndex)
      ws.selectedPageIndices = [...new Set(selected)].sort((a, b) => a - b).filter((i) => i >= 0 && i < total)
    },
  },
})
