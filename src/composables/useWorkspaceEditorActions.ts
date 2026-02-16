import type { WorkspaceTab } from '../stores/workspaceEditorTabs'
import { useWorkspaceTabsStore } from '../stores/workspaceEditorTabs'
import { useWorkspaceEditorWorkspaceStore } from '../stores/workspaceEditorWorkspace'
import { useWorkspaceEditorAnnotationsStore } from '../stores/workspaceEditorAnnotations'

export function useWorkspaceEditorActions() {
  const tabsStore = useWorkspaceTabsStore()
  const workspaceStore = useWorkspaceEditorWorkspaceStore()
  const annotationsStore = useWorkspaceEditorAnnotationsStore()

  function addTab(tab: WorkspaceTab, initial: { pdfSrc: string }): void {
    tabsStore.addTab(tab)
    workspaceStore.initWorkspace(tab.id, initial.pdfSrc)
    annotationsStore.initForTab(tab.id)
  }

  function closeTab(id: string): void {
    workspaceStore.destroyWorkspace(id)
    annotationsStore.destroyForTab(id)
    tabsStore.removeTab(id)
  }

  function reset(): void {
    workspaceStore.reset()
    annotationsStore.reset()
    tabsStore.reset()
  }

  function resetCanvas(): void {
    workspaceStore.resetCanvasForActive()
    annotationsStore.resetCanvasForActive()
  }

  return {
    addTab,
    closeTab,
    reset,
    resetCanvas,
  }
}
