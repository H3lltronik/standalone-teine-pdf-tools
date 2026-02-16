import {
  AnnotationType,
  TextAnnotationBorderStyle,
  DEFAULT_HIGHLIGHT_BRUSH_HEIGHT,
  DEFAULT_HIGHLIGHT_COLOR,
  type PdfAnnotation,
  type PdfImageAnnotation,
} from '../types/workspace-editor'
import { getResolvedTextStyle } from './services/annotations-service'

export interface ExportViewport {
  width: number
  height: number
  /** Scale used for the export canvas (e.g. 2); brush height and font scale with this. */
  scale: number
}

function drawImageAnnotationAsync(
  ctx: CanvasRenderingContext2D,
  ann: PdfImageAnnotation,
  w: number,
  h: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const x = ann.x * w
      const y = ann.y * h
      const width = ann.width * w
      const height = ann.height * h
      ctx.drawImage(img, x, y, width, height)
      resolve()
    }
    img.onerror = () => reject(new Error('Failed to load image annotation'))
    img.src = ann.src
  })
}

/**
 * Draws workspace annotations onto a 2D canvas context.
 * Annotations use normalized coords (0–1) and brushHeight in "pixels at scale 1".
 * viewport provides the canvas dimensions and scale for correct placement and sizing.
 * Image annotations are loaded asynchronously; the function returns a Promise.
 */
export async function drawAnnotationsOnCanvas(
  ctx: CanvasRenderingContext2D,
  annotations: PdfAnnotation[],
  viewport: ExportViewport
): Promise<void> {
  const { width: w, height: h, scale: s } = viewport
  for (const ann of annotations) {
    if (ann.type === AnnotationType.Text) {
      const x = ann.x * w
      const y = ann.y * h
      const style = getResolvedTextStyle(ann)
      const fontSize = Math.round(style.fontSize * s)
      const text = ann.text?.trim() || 'Texto'
      ctx.save()
      ctx.font = `${style.fontStyle} ${style.fontWeight} ${fontSize}px ${style.fontFamily}`
      const metrics = ctx.measureText(text)
      const textWidth = metrics.width
      const lineHeight = style.lineHeight
      const boxHeight = Math.round(fontSize * lineHeight)
      const padding = 2 * s
      const boxW = textWidth + padding * 2
      const boxH = boxHeight + padding
      const borderWidth = style.borderWidth ?? 1
      const strokeWidth = borderWidth * s

      if (style.borderStyle !== TextAnnotationBorderStyle.None && strokeWidth > 0) {
        ctx.strokeStyle = style.borderColor ?? '#3b82f6'
        ctx.lineWidth = strokeWidth
        if (style.borderStyle === TextAnnotationBorderStyle.Dashed) {
          ctx.setLineDash([4 * s, 2 * s])
        } else {
          ctx.setLineDash([])
        }
        ctx.strokeRect(x, y, boxW, boxH)
      }

      ctx.fillStyle = style.color
      ctx.fillText(text, x + padding, y + padding + fontSize)
      ctx.restore()
    } else if (ann.type === AnnotationType.Highlight && ann.path && ann.path.length >= 2) {
      const color = ann.color ?? DEFAULT_HIGHLIGHT_COLOR
      const brushHeight = (ann.brushHeight ?? DEFAULT_HIGHLIGHT_BRUSH_HEIGHT) * s
      ctx.save()
      ctx.strokeStyle = color
      ctx.lineWidth = brushHeight
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      const first = ann.path[0]
      if (first) ctx.moveTo(first.x * w, first.y * h)
      for (let i = 1; i < ann.path.length; i++) {
        const pt = ann.path[i]
        if (pt) ctx.lineTo(pt.x * w, pt.y * h)
      }
      ctx.stroke()
      ctx.restore()
    } else if (ann.type === AnnotationType.Image) {
      await drawImageAnnotationAsync(ctx, ann, w, h)
    }
  }
}
