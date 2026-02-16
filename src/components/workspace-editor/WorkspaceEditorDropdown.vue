<template>
  <Menu as="div" class="relative">
    <MenuButton
      class="flex items-center justify-center rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100"
      title="Más opciones"
    >
      <span class="material-symbols-outlined align-middle text-[24px] leading-none">more_vert</span>
    </MenuButton>
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="scale-95 opacity-0"
      enter-to-class="scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-95 opacity-0"
    >
      <MenuItems
        class="absolute right-0 top-full z-[60] mt-1 w-64 rounded-xl border border-slate-200 bg-white py-1.5 shadow-dropdown focus:outline-none"
      >
        <MenuItem v-slot="{ active }">
          <button
            type="button"
            class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-slate-700 transition-colors"
            :class="active ? 'bg-slate-50' : ''"
            @click="onDownloadWorkspacesZip"
          >
            <span class="material-symbols-outlined align-middle text-[20px] leading-none text-slate-500">folder_zip</span>
            <div class="flex flex-col">
              <span class="text-[11px] font-semibold">Descargar workspaces como zip</span>
              <span class="text-[9px] text-slate-400">Selección de uno, varios o todos</span>
            </div>
          </button>
        </MenuItem>
        <MenuItem v-slot="{ active }">
          <button
            type="button"
            class="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-2.5 text-left text-slate-700 transition-colors"
            :class="active ? 'bg-slate-50' : ''"
            @click="onMoveToCompress"
          >
            <span class="material-symbols-outlined align-middle text-[20px] leading-none text-slate-500">compress</span>
            <div class="flex flex-col">
              <span class="text-[11px] font-semibold">Mover workspaces a página "compress"</span>
              <span class="text-[9px] text-slate-400">Selección de uno, varios o todos</span>
            </div>
          </button>
        </MenuItem>
        <MenuItem v-slot="{ active }">
          <button
            type="button"
            class="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-2.5 text-left text-slate-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            :class="active ? 'bg-slate-50' : ''"
            :disabled="!canExportSelection || exporting"
            @click="onExportSelectionPdf"
          >
            <span class="material-symbols-outlined align-middle text-[20px] leading-none text-primary">download</span>
            <div class="flex flex-col">
              <span class="text-[11px] font-semibold">Exportar PDF de selección</span>
              <span class="text-[9px] text-slate-400">Solo las páginas seleccionadas, en su orden, con anotaciones</span>
            </div>
          </button>
        </MenuItem>
      </MenuItems>
    </Transition>
  </Menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { useWorkspaceExportPdf } from '../../composables/useWorkspaceExportPdf'

const { downloadSelectionPdf, canExportSelection } = useWorkspaceExportPdf()
const exporting = ref(false)

function onDownloadWorkspacesZip(): void {
  // TODO: download workspaces as zip
}

function onMoveToCompress(): void {
  // TODO: move to compress page
}

async function onExportSelectionPdf(): Promise<void> {
  if (!canExportSelection.value || exporting.value) return
  exporting.value = true
  try {
    await downloadSelectionPdf()
  } finally {
    exporting.value = false
  }
}
</script>
