import {
  AnnotationType,
  DEFAULT_HIGHLIGHT_BRUSH_HEIGHT,
  DEFAULT_HIGHLIGHT_COLOR,
  DEFAULT_TEXT_FONT_FAMILY,
  DEFAULT_TEXT_FONT_SIZE,
  DEFAULT_TEXT_FONT_WEIGHT,
  DEFAULT_TEXT_FONT_STYLE,
  DEFAULT_TEXT_LETTER_SPACING,
  DEFAULT_TEXT_LINE_HEIGHT,
  DEFAULT_TEXT_BORDER_WIDTH,
  DEFAULT_TEXT_BORDER_COLOR,
  DEFAULT_TEXT_BORDER_STYLE,
  DEFAULT_TEXT_COLOR,
  type Point,
  type PdfHighlightAnnotation,
  type PdfImageAnnotation,
  type PdfTextAnnotation,
  type PdfTextAnnotationStyle,
} from '../../types/workspace-editor'

const DEFAULT_TEXT_STYLE: Required<PdfTextAnnotationStyle> = {
  fontFamily: DEFAULT_TEXT_FONT_FAMILY,
  fontSize: DEFAULT_TEXT_FONT_SIZE,
  fontWeight: DEFAULT_TEXT_FONT_WEIGHT,
  fontStyle: DEFAULT_TEXT_FONT_STYLE,
  letterSpacing: DEFAULT_TEXT_LETTER_SPACING,
  lineHeight: DEFAULT_TEXT_LINE_HEIGHT,
  color: DEFAULT_TEXT_COLOR,
  borderWidth: DEFAULT_TEXT_BORDER_WIDTH,
  borderColor: DEFAULT_TEXT_BORDER_COLOR,
  borderStyle: DEFAULT_TEXT_BORDER_STYLE,
}

/** Returns resolved text annotation style (annotation.style merged with defaults). */
export function getResolvedTextStyle(annotation: PdfTextAnnotation): Required<PdfTextAnnotationStyle> {
  const s = annotation.style
  if (!s) return { ...DEFAULT_TEXT_STYLE }
  return {
    fontFamily: s.fontFamily ?? DEFAULT_TEXT_FONT_FAMILY,
    fontSize: s.fontSize ?? DEFAULT_TEXT_FONT_SIZE,
    fontWeight: s.fontWeight ?? DEFAULT_TEXT_FONT_WEIGHT,
    fontStyle: s.fontStyle ?? DEFAULT_TEXT_FONT_STYLE,
    letterSpacing: s.letterSpacing ?? DEFAULT_TEXT_LETTER_SPACING,
    lineHeight: s.lineHeight ?? DEFAULT_TEXT_LINE_HEIGHT,
    color: s.color ?? DEFAULT_TEXT_COLOR,
    borderWidth: s.borderWidth ?? DEFAULT_TEXT_BORDER_WIDTH,
    borderColor: s.borderColor ?? DEFAULT_TEXT_BORDER_COLOR,
    borderStyle: s.borderStyle ?? DEFAULT_TEXT_BORDER_STYLE,
  }
}

/** Builds an open path SVG "d" attribute from a list of points (e.g. highlight stroke). */
export function pathToSvgD(path: Point[]): string {
  if (path.length < 2) return ''
  const first = path[0]
  if (!first) return ''
  let d = `M ${first.x} ${first.y}`
  for (let i = 1; i < path.length; i++) {
    const pt = path[i]
    if (pt) d += ` L ${pt.x} ${pt.y}`
  }
  return d
}

/** Maps a mouse event to canvas coordinates using the container's bounding rect. */
export function pointFromMouseEvent(e: MouseEvent, containerRect: DOMRect): Point {
  return {
    x: e.clientX - containerRect.left,
    y: e.clientY - containerRect.top,
  }
}

/** Returns a new path with each point translated by (dx, dy). */
export function translatePath(path: Point[], dx: number, dy: number): Point[] {
  return path.map((p) => ({ x: p.x + dx, y: p.y + dy }))
}

export interface CreateHighlightOptions {
  color?: string
  brushHeight?: number
}

/** Creates a new highlight annotation payload. */
export function createHighlightAnnotation(
  path: Point[],
  options: CreateHighlightOptions = {}
): PdfHighlightAnnotation {
  return {
    type: AnnotationType.Highlight,
    x: 0,
    y: 0,
    path: [...path],
    color: options.color ?? DEFAULT_HIGHLIGHT_COLOR,
    brushHeight: options.brushHeight ?? DEFAULT_HIGHLIGHT_BRUSH_HEIGHT,
  }
}

/** Creates a new text annotation payload with default style. */
export function createTextAnnotation(x: number, y: number, text = ''): PdfTextAnnotation {
  return {
    type: AnnotationType.Text,
    x,
    y,
    text: text || undefined,
    style: {
      fontFamily: DEFAULT_TEXT_FONT_FAMILY,
      fontSize: DEFAULT_TEXT_FONT_SIZE,
      fontWeight: DEFAULT_TEXT_FONT_WEIGHT,
      fontStyle: DEFAULT_TEXT_FONT_STYLE,
      letterSpacing: DEFAULT_TEXT_LETTER_SPACING,
      lineHeight: DEFAULT_TEXT_LINE_HEIGHT,
      color: DEFAULT_TEXT_COLOR,
      borderWidth: DEFAULT_TEXT_BORDER_WIDTH,
      borderColor: DEFAULT_TEXT_BORDER_COLOR,
      borderStyle: DEFAULT_TEXT_BORDER_STYLE,
    },
  }
}

/** Default fractional size for new image annotations (fraction of page width). */
export const DEFAULT_IMAGE_ANNOTATION_WIDTH = 0.25

/** Creates a new image annotation. x, y, width, height are normalized 0–1. */
export function createImageAnnotation(
  x: number,
  y: number,
  width: number,
  height: number,
  src: string
): PdfImageAnnotation {
  return {
    type: AnnotationType.Image,
    x,
    y,
    width,
    height,
    src,
  }
}
