<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'

interface RouteSeoMeta {
  title?: string
  description?: string
  path?: string
  robots?: string
}

const SITE_URL = 'https://teineapp.org'
const SITE_NAME = 'Teine PDF Tools'
const DEFAULT_TITLE = 'Teine PDF Tools | Comprimir y editar PDFs online'
const DEFAULT_DESCRIPTION =
  'Comprime y edita archivos PDF en tu navegador. Todos los archivos que quieras, sin limites. Rapido, privado y sin subir documentos a servidores.'
const DEFAULT_IMAGE_URL = `${SITE_URL}/apple-touch-icon.png`

function isRouteSeoMeta(value: unknown): value is RouteSeoMeta {
  if (typeof value !== 'object' || value === null) return false
  const meta = value as Record<string, unknown>
  const validTitle = meta.title === undefined || typeof meta.title === 'string'
  const validDescription = meta.description === undefined || typeof meta.description === 'string'
  const validPath = meta.path === undefined || typeof meta.path === 'string'
  const validRobots = meta.robots === undefined || typeof meta.robots === 'string'
  return validTitle && validDescription && validPath && validRobots
}

const route = useRoute()

const routeSeo = computed<RouteSeoMeta>(() => {
  const seo = route.meta?.seo
  return isRouteSeoMeta(seo) ? seo : {}
})

const pageTitle = computed(() => routeSeo.value.title ?? DEFAULT_TITLE)
const pageDescription = computed(() => routeSeo.value.description ?? DEFAULT_DESCRIPTION)
const canonicalUrl = computed(() => {
  const path = routeSeo.value.path ?? route.path
  return `${SITE_URL}${path}`
})
const robots = computed(() => routeSeo.value.robots ?? 'index, follow')
const webPageJsonLd = computed(() =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageTitle.value,
    description: pageDescription.value,
    url: canonicalUrl.value,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
  })
)

useHead(() => ({
  title: pageTitle.value,
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl.value,
    },
  ],
  meta: [
    {
      name: 'description',
      content: pageDescription.value,
    },
    {
      name: 'robots',
      content: robots.value,
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:site_name',
      content: SITE_NAME,
    },
    {
      property: 'og:locale',
      content: 'es_ES',
    },
    {
      property: 'og:title',
      content: pageTitle.value,
    },
    {
      property: 'og:description',
      content: pageDescription.value,
    },
    {
      property: 'og:url',
      content: canonicalUrl.value,
    },
    {
      property: 'og:image',
      content: DEFAULT_IMAGE_URL,
    },
    {
      property: 'og:image:width',
      content: '180',
    },
    {
      property: 'og:image:height',
      content: '180',
    },
    {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      name: 'twitter:title',
      content: pageTitle.value,
    },
    {
      name: 'twitter:description',
      content: pageDescription.value,
    },
    {
      name: 'twitter:image',
      content: DEFAULT_IMAGE_URL,
    },
  ],
  script: [
    {
      type: 'application/ld+json',
      key: 'webpage-jsonld',
      textContent: webPageJsonLd.value,
    },
  ],
}))
</script>

<template>
  <router-view />
</template>
