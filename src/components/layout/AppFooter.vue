<template>
  <footer class="mt-auto border-t border-slate-200 bg-white py-6">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
      <div class="flex items-center gap-4">
        <span>{{ copyrightText }}</span>
        <a
          href="/PRIVACY_NOTICE.pdf"
          target="_blank"
          class="transition-colors hover:text-primary"
        >Aviso de Privacidad</a>
        <a
          href="/TERMS_OF_SERVICE.pdf"
          target="_blank"
          class="transition-colors hover:text-primary"
        >Términos del Servicio</a>
      </div>
      <!-- <div class="flex items-center gap-2">
        <span class="size-2 rounded-full bg-emerald-500" />
        <span>{{ statusText }}</span>
      </div> -->
    </div>
  </footer>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    copyrightText?: string
    statusText?: string
  }>(),
  {
    copyrightText: '© 2025 Teine PDF Tools',
    statusText: '',
  }
)
</script>
