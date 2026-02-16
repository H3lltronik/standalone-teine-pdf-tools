import { computed } from 'vue'
import { useWorkspaceEditorWorkspaceStore } from '../stores/workspaceEditorWorkspace'
import { useWorkspaceEditorAnnotationsStore } from '../stores/workspaceEditorAnnotations'
import { useWorkspaceTabsStore } from '../stores/workspaceEditorTabs'
import type { PageRotation } from '../types/workspace-editor'
import {
  drawAnnotationsOnCanvas,
  type ExportViewport,
} from '../lib/export-annotations-canvas'
import { jsPDF, type ImageCompression, type ImageFormat } from 'jspdf'
import * as pdfjsLib from 'pdfjs-dist'

const EXPORT_SCALE = 2
const EXPORT_JPEG_QUALITY = 0.92
const EXPORT_IMAGE_FORMAT: ImageFormat = 'JPEG'
const EXPORT_IMAGE_COMPRESSION: ImageCompression = 'FAST'
const JSPDF_UNIT_PT = 'pt' as const

export interface UseWorkspaceExportPdfReturn {
  /** Exports the active workspace (all pages in current order + annotations) to a PDF blob. */
  exportToPdf: () => Promise<Blob>
  /** Exports only the selected pages (header checkboxes) in selection order; same format as exportToPdf. */
  exportSelectionToPdf: () => Promise<Blob>
  /** Downloads the full current PDF (all pages). */
  downloadPdf: (filename?: string) => Promise<void>
  /** Downloads a PDF containing only the selected pages, in selection order, with annotations. */
  downloadSelectionPdf: (filename?: string) => Promise<void>
  /** True if there is an active workspace with a PDF to export. */
  canExport: import('vue').ComputedRef<boolean>
  /** True if there is at least one page selected (for selection export). */
  canExportSelection: import('vue').ComputedRef<boolean>
}

/**
 * Composable that uses the workspace and annotations stores to render the active
 * workspace (current page order and annotations) into a new PDF for download.
 */
export function useWorkspaceExportPdf(): UseWorkspaceExportPdfReturn {
  const workspaceStore = useWorkspaceEditorWorkspaceStore()
  const annotationsStore = useWorkspaceEditorAnnotationsStore()
  const tabsStore = useWorkspaceTabsStore()

  const canExport = computed(
    () =>
      tabsStore.activeTabId != null &&
      workspaceStore.activeWorkspace != null &&
      workspaceStore.totalNumPages > 0
  )

  const selectedPageIndices = computed(
    () => workspaceStore.activeWorkspace?.selectedPageIndices ?? []
  )

  const canExportSelection = computed(
    () => canExport.value && selectedPageIndices.value.length > 0
  )

  const MM_TO_PT = 72 / 25.4

  /**
   * Core export: renders the given display indices (in order) into a single PDF
   * using effective display order (PDF + added), rotations and annotations.
   */
  async function renderPagesToPdfBlob(displayIndices: number[]): Promise<Blob> {
    const slots = workspaceStore.effectiveDisplaySlots
    const pageRotations = workspaceStore.pageRotations
    const annotationsByPage = annotationsStore.annotationsByPage
    const addedPages = workspaceStore.addedPages
    const addedById = new Map(addedPages.map((a) => [a.id, a]))
    const pdfSrc = workspaceStore.pdfSrc

    if (displayIndices.length === 0) {
      throw new Error('No pages to export')
    }

    let pdfDoc: pdfjsLib.PDFDocumentProxy | null = null
    if (pdfSrc) {
      const arrayBuffer = await fetch(pdfSrc).then((r) => {
        if (!r.ok) throw new Error(`Failed to load PDF: ${r.statusText}`)
        return r.arrayBuffer()
      })
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      pdfDoc = await loadingTask.promise
    }

    const doc = new jsPDF({ unit: JSPDF_UNIT_PT, compress: true })

    for (const displayIndex of displayIndices) {
      const slot = slots[displayIndex]
      const rot = (pageRotations[displayIndex] ?? 0) as PageRotation
      let widthPt: number
      let heightPt: number

      if (slot?.type === 'pdf' && pdfDoc) {
        const pdfPageNum = slot.pdfIndex + 1
        const page = await pdfDoc.getPage(pdfPageNum)
        const viewport = page.getViewport({ scale: EXPORT_SCALE, rotation: rot })
        widthPt = viewport.width
        heightPt = viewport.height

        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas 2D context not available')

        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise

        const pageAnnotations = annotationsByPage[displayIndex] ?? []
        const exportViewport: ExportViewport = {
          width: viewport.width,
          height: viewport.height,
          scale: EXPORT_SCALE,
        }
        await drawAnnotationsOnCanvas(ctx, pageAnnotations, exportViewport)

        const dataUrl = canvas.toDataURL('image/jpeg', EXPORT_JPEG_QUALITY)
        doc.addPage([widthPt, heightPt])
        doc.addImage(
          dataUrl,
          EXPORT_IMAGE_FORMAT,
          0,
          0,
          widthPt,
          heightPt,
          undefined,
          EXPORT_IMAGE_COMPRESSION
        )
      } else if (slot?.type === 'added') {
        const ap = addedById.get(slot.id)
        const wMm = ap?.widthMm ?? 210
        const hMm = ap?.heightMm ?? 297
        const swap = rot === 90 || rot === 270
        widthPt = (swap ? hMm : wMm) * MM_TO_PT
        heightPt = (swap ? wMm : hMm) * MM_TO_PT

        const scalePx = EXPORT_SCALE
        const canvas = document.createElement('canvas')
        canvas.width = widthPt * scalePx
        canvas.height = heightPt * scalePx
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas 2D context not available')
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const pageAnnotations = annotationsByPage[displayIndex] ?? []
        const exportViewport: ExportViewport = {
          width: canvas.width,
          height: canvas.height,
          scale: scalePx,
        }
        await drawAnnotationsOnCanvas(ctx, pageAnnotations, exportViewport)

        const dataUrl = canvas.toDataURL('image/jpeg', EXPORT_JPEG_QUALITY)
        doc.addPage([widthPt, heightPt])
        doc.addImage(
          dataUrl,
          EXPORT_IMAGE_FORMAT,
          0,
          0,
          widthPt,
          heightPt,
          undefined,
          EXPORT_IMAGE_COMPRESSION
        )
      } else {
        widthPt = 210 * MM_TO_PT
        heightPt = 297 * MM_TO_PT
        doc.addPage([widthPt, heightPt])
      }
    }

    doc.deletePage(1)
    return doc.output('blob')
  }

  async function exportToPdf(): Promise<Blob> {
    const total = workspaceStore.totalNumPages
    if (total === 0) throw new Error('No pages to export')
    return renderPagesToPdfBlob(Array.from({ length: total }, (_, i) => i))
  }

  async function exportSelectionToPdf(): Promise<Blob> {
    const indices = selectedPageIndices.value
    if (indices.length === 0) throw new Error('No pages selected')
    return renderPagesToPdfBlob([...indices].sort((a, b) => a - b))
  }

  async function downloadPdf(filename?: string): Promise<void> {
    const blob = await exportToPdf()
    const name = filename ?? `documento-exportado-${Date.now()}.pdf`
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name.endsWith('.pdf') ? name : `${name}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function downloadSelectionPdf(filename?: string): Promise<void> {
    const blob = await exportSelectionToPdf()
    const name = filename ?? `documento-seleccion-${Date.now()}.pdf`
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name.endsWith('.pdf') ? name : `${name}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    exportToPdf,
    exportSelectionToPdf,
    downloadPdf,
    downloadSelectionPdf,
    canExport,
    canExportSelection,
  }
}
