<template>
  <div v-if="enabled" class="google-ad-container" :class="$attrs.class">
    <ins
      ref="insRef"
      class="adsbygoogle"
      :data-ad-client="CLIENT_ID"
      :data-ad-slot="slotId"
      :data-ad-format="format"
      data-full-width-responsive="true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { AdFormat } from '@/lib/ads/types'
import { loadAdSense, isAdSenseConfigured } from '@/lib/ads/adsense-loader'

const CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID as string | undefined

const props = withDefaults(
  defineProps<{
    slotId: string
    format?: AdFormat
  }>(),
  { format: 'auto' }
)

const insRef = ref<HTMLElement | null>(null)

const enabled = computed(() => isAdSenseConfigured(CLIENT_ID) && props.slotId.length > 0)

function fillSlot() {
  if (!insRef.value || !window.adsbygoogle) return
  try {
    window.adsbygoogle.push({})
  } catch {
    // AdSense may reject duplicate or invalid slots
  }
}

onMounted(async () => {
  if (!enabled.value) return
  if (CLIENT_ID) await loadAdSense(CLIENT_ID)
  fillSlot()
})

watch(
  () => [props.slotId, insRef.value] as const,
  () => {
    if (enabled.value && insRef.value) fillSlot()
  },
  { flush: 'post' }
)
</script>
