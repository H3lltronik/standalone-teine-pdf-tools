export interface PageThumbnail {
  id: string
  thumbnail: string | null
  /** True when this page is the current viewport page (border/active). */
  isCurrentPage: boolean
  /** True when this page is in the multi-select selection (checkbox checked). */
  checkboxSelected: boolean
}

/** Preset for new page size in "add page" dialog. */
export type AddPageSizePreset = 'carta' | 'oficio' | 'custom'

export interface AddPageConfirmPayload {
  preset: AddPageSizePreset
  widthMm?: number
  heightMm?: number
}
