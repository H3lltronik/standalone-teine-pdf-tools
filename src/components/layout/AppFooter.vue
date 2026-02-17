<template>
  <footer class="mt-auto border-t border-slate-200 bg-white py-4">
    <div class="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 lg:flex-row lg:flex-wrap lg:items-center lg:justify-start lg:gap-x-4 lg:gap-y-3">
      <a
        href="https://h3lltronik-portfolio-v1.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        class="shrink-0 transition-opacity hover:opacity-80"
      >
        <img
          src="@/assets/h3lltronik_logo.svg"
          alt="Hecho por"
          class="h-7 w-auto object-contain sm:h-8 lg:h-10"
        />
      </a>
      <span class="shrink-0 text-center lg:text-left">{{ copyrightText }}</span>
      <nav class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 lg:justify-start" aria-label="Legal">
        <a
          href="/PRIVACY_NOTICE.pdf"
          target="_blank"
          class="text-slate-600 transition-colors hover:text-primary"
        >Aviso de Privacidad</a>
        <a
          href="/TERMS_OF_SERVICE.pdf"
          target="_blank"
          class="text-slate-600 transition-colors hover:text-primary"
        >Términos del Servicio</a>
      </nav>
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
