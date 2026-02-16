/** Herramienta activa en el canvas del editor (texto, resaltado, imagen o ninguna). */
export enum EditorTool {
  None = 'none',
  Text = 'text',
  Highlight = 'highlight',
  Image = 'image',
}

/** Tipo de anotación sobre el PDF. */
export enum AnnotationType {
  Text = 'text',
  Highlight = 'highlight',
  Image = 'image',
}

export interface Point {
  x: number
  y: number
}

export interface PdfAnnotationBase {
  type: AnnotationType
  /** X position normalized 0–1 (relative to page width) for zoom-invariant placement. */
  x: number
  /** Y position normalized 0–1 (relative to page height) for zoom-invariant placement. */
  y: number
}

/** Font family options for text annotations (demo set). */
export const TEXT_ANNOTATION_FONTS = ['Arial', 'Georgia', 'Courier New'] as const
export type TextAnnotationFontFamily = (typeof TEXT_ANNOTATION_FONTS)[number]

/** Font weight for text annotations. */
export enum TextAnnotationFontWeight {
  Normal = 'normal',
  Bold = 'bold',
}

/** Font style (italic) for text annotations. */
export enum TextAnnotationFontStyle {
  Normal = 'normal',
  Italic = 'italic',
}

/** Border style for text annotation box. */
export enum TextAnnotationBorderStyle {
  Solid = 'solid',
  Dashed = 'dashed',
  None = 'none',
}

/** Dropdown option entry for text annotation style choices. */
export interface TextAnnotationStyleOption<T extends string = string> {
  value: T
  label: string
}

/** Options for font weight dropdown. */
export const TEXT_FONT_WEIGHT_OPTIONS: TextAnnotationStyleOption<TextAnnotationFontWeight>[] = [
  { value: TextAnnotationFontWeight.Normal, label: 'Normal' },
  { value: TextAnnotationFontWeight.Bold, label: 'Negrita' },
]

/** Options for font style dropdown. */
export const TEXT_FONT_STYLE_OPTIONS: TextAnnotationStyleOption<TextAnnotationFontStyle>[] = [
  { value: TextAnnotationFontStyle.Normal, label: 'Normal' },
  { value: TextAnnotationFontStyle.Italic, label: 'Cursiva' },
]

/** Options for border style dropdown. */
export const TEXT_BORDER_STYLE_OPTIONS: TextAnnotationStyleOption<TextAnnotationBorderStyle>[] = [
  { value: TextAnnotationBorderStyle.Solid, label: 'Sólido' },
  { value: TextAnnotationBorderStyle.Dashed, label: 'Discontinuo' },
  { value: TextAnnotationBorderStyle.None, label: 'Sin borde' },
]

/** Defaults for text annotation styling. */
export const DEFAULT_TEXT_FONT_FAMILY: TextAnnotationFontFamily = 'Arial'
export const DEFAULT_TEXT_FONT_SIZE = 12
export const DEFAULT_TEXT_FONT_WEIGHT = TextAnnotationFontWeight.Normal
export const DEFAULT_TEXT_FONT_STYLE = TextAnnotationFontStyle.Normal
export const DEFAULT_TEXT_LETTER_SPACING = 0
export const DEFAULT_TEXT_LINE_HEIGHT = 1.2
export const DEFAULT_TEXT_BORDER_WIDTH = 1
export const DEFAULT_TEXT_BORDER_COLOR = 'rgb(59, 130, 246)'
export const DEFAULT_TEXT_BORDER_STYLE = TextAnnotationBorderStyle.Solid
export const DEFAULT_TEXT_COLOR = '#1e293b'

/** Min/max constants for numeric style inputs. */
export const TEXT_FONT_SIZE_MIN = 8
export const TEXT_FONT_SIZE_MAX = 72
export const TEXT_LINE_HEIGHT_MIN = 0.8
export const TEXT_LINE_HEIGHT_MAX = 3
export const TEXT_LETTER_SPACING_MIN = -2
export const TEXT_LETTER_SPACING_MAX = 10
export const TEXT_BORDER_WIDTH_MIN = 0
export const TEXT_BORDER_WIDTH_MAX = 8

/** Style property keys for integer numeric fields (fontSize, borderWidth). */
export const TEXT_STYLE_KEY = {
  FONT_SIZE: 'fontSize',
  BORDER_WIDTH: 'borderWidth',
  LINE_HEIGHT: 'lineHeight',
  LETTER_SPACING: 'letterSpacing',
} as const

export type TextAnnotationStyleIntegerKey =
  (typeof TEXT_STYLE_KEY)[keyof Pick<typeof TEXT_STYLE_KEY, 'FONT_SIZE' | 'BORDER_WIDTH'>]
export type TextAnnotationStyleFloatKey =
  (typeof TEXT_STYLE_KEY)[keyof Pick<typeof TEXT_STYLE_KEY, 'LINE_HEIGHT' | 'LETTER_SPACING'>]

export interface PdfTextAnnotationStyle {
  fontFamily?: TextAnnotationFontFamily | string
  fontSize?: number
  fontWeight?: TextAnnotationFontWeight
  fontStyle?: TextAnnotationFontStyle
  letterSpacing?: number
  lineHeight?: number
  /** CSS color for text (default: DEFAULT_TEXT_COLOR). */
  color?: string
  borderWidth?: number
  borderColor?: string
  borderStyle?: TextAnnotationBorderStyle
}

export interface PdfTextAnnotation extends PdfAnnotationBase {
  type: AnnotationType.Text
  text?: string
  width?: number
  height?: number
  /** Text and box styling. */
  style?: PdfTextAnnotationStyle
}

/** CSS color for highlight stroke (default for new highlights). */
export const DEFAULT_HIGHLIGHT_COLOR = 'rgba(255, 235, 59, 0.5)'
/** Default brush height (stroke width) in px for linear highlighter. */
export const DEFAULT_HIGHLIGHT_BRUSH_HEIGHT = 24

export interface PdfHighlightAnnotation extends PdfAnnotationBase {
  type: AnnotationType.Highlight
  /** Polyline (open path) normalized 0–1 for zoom-invariant placement. */
  path: Point[]
  /** CSS color for the stroke (default: DEFAULT_HIGHLIGHT_COLOR). */
  color?: string
  /** Brush height in px at scale 1; scaled by current zoom when rendering. */
  brushHeight?: number
}

/** Image annotation: position and size normalized 0–1 (fraction of page); src is data URL. */
export interface PdfImageAnnotation extends PdfAnnotationBase {
  type: AnnotationType.Image
  /** Width as fraction of page width (0–1). */
  width: number
  /** Height as fraction of page height (0–1). */
  height: number
  /** Data URL of the image (e.g. from FileReader). */
  src: string
}

export type PdfAnnotation = PdfTextAnnotation | PdfHighlightAnnotation | PdfImageAnnotation

/** URL del PDF por defecto al crear workspace inicial o nuevo documento (para pruebas). */
export const DEFAULT_PDF_SRC =
  'https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf'

export const DEFAULT_PDF_SCALE = 1.25
export const MIN_PDF_SCALE = 0.5
export const MAX_PDF_SCALE = 2.5
export const PDF_SCALE_STEP = 0.25

/** Selection of an annotation (page + index). Used inside WorkspaceState. */
export interface SelectedAnnotation {
  pageIndex: number
  annotationIndex: number
}

/** Rotation in degrees for a page (0, 90, 180, 270). */
export type PageRotation = 0 | 90 | 180 | 270

/** Blank page added by user (dimensions in mm). Displayed after PDF pages. */
export interface AddedPage {
  id: string
  widthMm: number
  heightMm: number
}

/** Single slot in the unified display order (PDF page or added blank page). */
export type DisplaySlot =
  | { type: 'pdf'; pdfIndex: number }
  | { type: 'added'; id: string }

/** Preset dimensions in mm for "add blank page" (Carta, Oficio). */
export const ADDED_PAGE_PRESET_MM = {
  carta: { widthMm: 216, heightMm: 279 },
  oficio: { widthMm: 216, heightMm: 356 },
} as const

/** Document/visor state per tab (workspace store). */
export interface WorkspaceDocState {
  pdfSrc: string
  scale: number
  activeTool: EditorTool
  /** Number of pages from the loaded PDF. */
  numPages: number
  /** Blank pages added by user; displayed after PDF pages. */
  addedPages: AddedPage[]
  currentPageIndex: number
  /** Object URLs for page thumbnails (barra de miniaturas). Revoke on tab remove. Length = totalNumPages. */
  pageThumbnailUrls: (string | null)[]
  /** Page indices selected via checkbox (multi-select). */
  selectedPageIndices: number[]
  /** Rotation in degrees per display page index (0, 90, 180, 270). Length = totalNumPages. */
  pageRotations: number[]
  /**
   * Display order for PDF only: pageOrder[displayIndex] = pdf page index (0-based).
   * If length !== numPages, treat as identity [0, 1, ..., numPages-1].
   */
  pageOrder: number[]
  /**
   * Unified display order (PDF + added). Length = totalNumPages.
   * When set, used for reordering; when not set, derived from pageOrder + addedPages.
   */
  displaySlots?: DisplaySlot[]
}

/** Total display pages = PDF pages + added blank pages. */
export function getTotalNumPages(ws: WorkspaceDocState): number {
  return ws.numPages + ws.addedPages.length
}

/** Effective display order: use displaySlots if length matches totalNumPages, else derive from pageOrder + addedPages. */
export function getEffectiveDisplaySlots(ws: WorkspaceDocState): DisplaySlot[] {
  const total = getTotalNumPages(ws)
  if (total === 0) return []
  const stored = ws.displaySlots
  if (stored != null && stored.length === total) return stored
  const n = ws.numPages
  const order = ws.pageOrder?.length === n ? ws.pageOrder : Array.from({ length: n }, (_, i) => i)
  const pdfSlots: DisplaySlot[] = order.map((pdfIndex) => ({ type: 'pdf', pdfIndex }))
  const addedSlots: DisplaySlot[] = ws.addedPages.map((a) => ({ type: 'added', id: a.id }))
  return [...pdfSlots, ...addedSlots]
}

/** Annotations state per tab (annotations store). */
export interface WorkspaceAnnotationsState {
  annotationsByPage: PdfAnnotation[][]
  selectedAnnotation: SelectedAnnotation | null
}

/** State for a single workspace (one PDF / one tab). Kept for reference; split into WorkspaceDocState + WorkspaceAnnotationsState. */
export interface WorkspaceState extends WorkspaceDocState, WorkspaceAnnotationsState {}

export function createDefaultWorkspaceDocState(pdfSrc: string): WorkspaceDocState {
  return {
    pdfSrc,
    scale: DEFAULT_PDF_SCALE,
    activeTool: EditorTool.None,
    numPages: 0,
    addedPages: [],
    currentPageIndex: 0,
    pageThumbnailUrls: [],
    selectedPageIndices: [],
    pageRotations: [],
    pageOrder: [],
  }
}

export function createDefaultWorkspaceAnnotationsState(): WorkspaceAnnotationsState {
  return {
    annotationsByPage: [],
    selectedAnnotation: null,
  }
}

export function createDefaultWorkspaceState(pdfSrc: string): WorkspaceState {
  return {
    ...createDefaultWorkspaceDocState(pdfSrc),
    ...createDefaultWorkspaceAnnotationsState(),
  }
}
