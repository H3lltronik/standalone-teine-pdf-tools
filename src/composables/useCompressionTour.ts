import type { TourGuideLabels, TourGuideStep } from 'v-tour-guide'

const TOUR_LABELS: TourGuideLabels = {
  skip: 'Omitir',
  next: 'Siguiente',
  previous: 'Anterior',
  finish: 'Finalizar',
}

const COMPRESSION_TOUR_STEPS: TourGuideStep[] = [
  {
    id: 'welcome',
    title: 'Comprimir PDF',
    content:
      'Aquí puedes reducir el tamaño de tus archivos PDF. Sigue los pasos para conocer las opciones.',
    target: 'tour-welcome',
    direction: 'bottom',
    showAction: true,
  },
  {
    id: 'add-files',
    title: 'Añadir archivos',
    content: 'Haz clic aquí para seleccionar uno o varios PDF desde tu dispositivo.',
    target: 'tour-add-files',
    direction: 'bottom',
    showAction: true,
  },
  {
    id: 'files-grid',
    title: 'Lista de archivos',
    content:
      'Los archivos añadidos aparecen aquí. Puedes eliminar uno o añadir más desde el botón "+".',
    target: 'tour-files-grid',
    direction: 'top',
    showAction: true,
  },
  {
    id: 'sidebar-config',
    title: 'Panel de configuración',
    content: 'En este panel ajustas las opciones de compresión y lanzas el proceso.',
    target: 'tour-sidebar-config',
    direction: 'left',
    showAction: true,
  },
  {
    id: 'sidebar-weight',
    title: 'Peso de compresión',
    content:
      'Puedes aplicar el mismo peso target a todos los archivos o definir un peso por archivo. El peso target indica el tamaño objetivo en MB.',
    target: 'tour-sidebar-weight',
    direction: 'left',
    showAction: true,
  },
  {
    id: 'sidebar-breakdown',
    title: 'Resumen de lote',
    content:
      'Aquí ves el número de archivos, el peso original total y la estimación del peso final tras la compresión.',
    target: 'tour-sidebar-breakdown',
    direction: 'left',
    showAction: true,
  },
  {
    id: 'sidebar-actions',
    title: 'Comprimir y descargar',
    content:
      '"Comprimir Lote" procesa todos los PDF y descarga un ZIP con los optimizados. "Restablecer" limpia la lista y vuelve a empezar.',
    target: 'tour-sidebar-actions',
    direction: 'top',
    showAction: true,
  },
]

export function useCompressionTour() {
  return {
    steps: COMPRESSION_TOUR_STEPS,
    labels: TOUR_LABELS,
  }
}
