import type { Ref } from 'vue'
import type { TourGuideLabels, TourGuideStep } from 'v-tour-guide'

const TOUR_LABELS: TourGuideLabels = {
  skip: 'Omitir',
  next: 'Siguiente',
  previous: 'Anterior',
  finish: 'Finalizar',
}

export const STEP_ID = {
  WELCOME: 'welcome',
  ADD_FILES: 'add-files',
  FILES_GRID: 'files-grid',
  SIDEBAR_CONFIG: 'sidebar-config',
  SIDEBAR_WEIGHT: 'sidebar-weight',
  SIDEBAR_BREAKDOWN: 'sidebar-breakdown',
  SIDEBAR_ACTIONS: 'sidebar-actions',
} as const

const TOUR_TARGET_PREFIX = 'tour-'

export function tourTarget(stepId: string): string {
  return `${TOUR_TARGET_PREFIX}${stepId}`
}

/** Step ids from "Panel de configuración" onwards: sidebar must be open for these. */
const SIDEBAR_OPEN_STEP_IDS: Set<string> = new Set([
  STEP_ID.SIDEBAR_CONFIG,
  STEP_ID.SIDEBAR_WEIGHT,
  STEP_ID.SIDEBAR_BREAKDOWN,
  STEP_ID.SIDEBAR_ACTIONS,
])

const COMPRESSION_TOUR_STEPS: TourGuideStep[] = [
  {
    id: STEP_ID.WELCOME,
    title: 'Comprimir PDF',
    content:
      'Aquí puedes reducir el tamaño de tus archivos PDF. Sigue los pasos para conocer las opciones.',
    target: tourTarget(STEP_ID.WELCOME),
    direction: 'bottom',
    showAction: true,
  },
  {
    id: STEP_ID.ADD_FILES,
    title: 'Añadir archivos',
    content: 'Haz clic aquí para seleccionar uno o varios PDF desde tu dispositivo.',
    target: tourTarget(STEP_ID.ADD_FILES),
    direction: 'bottom',
    showAction: true,
  },
  {
    id: STEP_ID.FILES_GRID,
    title: 'Lista de archivos',
    content:
      'Los archivos añadidos aparecen aquí. Puedes eliminar uno o añadir más desde el botón "+".',
    target: tourTarget(STEP_ID.FILES_GRID),
    direction: 'top',
    showAction: true,
  },
  {
    id: STEP_ID.SIDEBAR_CONFIG,
    title: 'Panel de configuración',
    content: 'En este panel ajustas las opciones de compresión y lanzas el proceso.',
    target: tourTarget(STEP_ID.SIDEBAR_CONFIG),
    direction: 'left',
    showAction: true,
  },
  {
    id: STEP_ID.SIDEBAR_WEIGHT,
    title: 'Peso de compresión',
    content:
      'Puedes aplicar el mismo peso target a todos los archivos o definir un peso por archivo. El peso target indica el tamaño objetivo en MB.',
    target: tourTarget(STEP_ID.SIDEBAR_WEIGHT),
    direction: 'left',
    showAction: true,
  },
  {
    id: STEP_ID.SIDEBAR_BREAKDOWN,
    title: 'Resumen de lote',
    content:
      'Aquí ves el número de archivos, el peso original total y la estimación del peso final tras la compresión.',
    target: tourTarget(STEP_ID.SIDEBAR_BREAKDOWN),
    direction: 'left',
    showAction: true,
  },
  {
    id: STEP_ID.SIDEBAR_ACTIONS,
    title: 'Comprimir y descargar',
    content:
      '"Comprimir Lote" procesa todos los PDF y descarga un ZIP con los optimizados. "Restablecer" limpia la lista y vuelve a empezar.',
    target: tourTarget(STEP_ID.SIDEBAR_ACTIONS),
    direction: 'top',
    showAction: true,
  },
]

export function useCompressionTour(sidebarOpenRef: Ref<boolean>) {
  function onTourStepChange(step: TourGuideStep) {
    sidebarOpenRef.value = SIDEBAR_OPEN_STEP_IDS.has(step.id)
  }

  function onTourEnd() {
    sidebarOpenRef.value = false
  }

  return {
    steps: COMPRESSION_TOUR_STEPS,
    labels: TOUR_LABELS,
    onTourStepChange,
    onTourEnd,
  }
}
