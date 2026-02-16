<template>
  <div class="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
    <!-- Hero -->
    <section class="mb-16 text-center">
      <h1 class="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
        Comprime y edita PDFs
        <span class="block bg-linear-to-r from-primary to-primary-dark bg-clip-text text-transparent">
          sin salir del navegador
        </span>
      </h1>
      <p class="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
        Dos herramientas en una: aligera tus documentos o anótalos y edítalos. Cero instalaciones, cero subidas a la nube.
      </p>
    </section>

    <!-- Tools -->
    <section class="mb-16">
      <div class="grid gap-8 lg:grid-cols-2">
        <router-link
          to="/compression"
          class="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
          @click="analytics.trackToolClick({ tool: 'compression', source: 'home_card' })"
        >
          <div class="flex flex-col p-8 sm:p-10">
            <div class="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-colors duration-300 group-hover:bg-emerald-500 group-hover:text-white">
              <span class="material-symbols-outlined text-3xl">compress</span>
            </div>
            <h2 class="text-2xl font-bold text-slate-900">Comprimir y optimizar</h2>
            <p class="mt-3 text-slate-600">
              Archivos más ligeros sin sacrificar legibilidad. Ajusta calidad e imágenes, limpia metadatos y prepara tus PDFs para correo o web en segundos.
            </p>
            <div class="mt-6 flex items-center gap-2 text-primary font-medium">
              <span>Comprimir PDF</span>
              <span class="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">arrow_forward</span>
            </div>
          </div>
        </router-link>

        <router-link
          to="/workspaces/editor"
          class="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
          @click="analytics.trackToolClick({ tool: 'editor', source: 'home_card' })"
        >
          <div class="flex flex-col p-8 sm:p-10">
            <div class="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
              <span class="material-symbols-outlined text-3xl">edit_document</span>
            </div>
            <h2 class="text-2xl font-bold text-slate-900">Editar y anotar</h2>
            <p class="mt-3 text-slate-600">
              Resaltados, texto, imágenes y marcas sobre el documento. Varios PDFs en un mismo espacio, reordenar páginas y tener todo listo para firmar o compartir.
            </p>
            <div class="mt-6 flex items-center gap-2 text-primary font-medium">
              <span>Abrir editor</span>
              <span class="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">arrow_forward</span>
            </div>
          </div>
        </router-link>
      </div>
    </section>

    <!-- Security Notice -->
    <section>
      <div class="rounded-2xl border border-slate-200 bg-linear-to-br from-slate-50 to-white p-8 shadow-sm">
        <div class="flex flex-wrap items-start gap-4 sm:flex-nowrap">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600">
            <span class="material-symbols-outlined text-2xl">shield</span>
          </div>
          <div class="min-w-0 flex-1">
            <h4 class="text-lg font-semibold text-slate-900">100% en tu navegador</h4>
            <p class="mt-2 text-sm text-slate-600">
              Todo el proceso ocurre en tu dispositivo. Los archivos no se suben a ningún servidor: tus documentos nunca salen de tu ordenador y son 100% seguros.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useAnalytics } from '@/composables/useAnalytics'

const analytics = useAnalytics()
</script>
