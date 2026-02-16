<template>
  <fieldset class="rounded-lg border border-gray-200 bg-white p-4">
    <legend class="text-sm font-semibold text-gray-900 px-1">browser-image-compression options</legend>

    <div class="mt-4 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
      <span class="text-sm text-gray-700 sm:text-right">skipImageResize</span>
      <div class="flex items-center">
        <input v-model="opts.skipImageResize" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500" />
        <span class="ml-2 text-sm text-gray-600">Skip split to images and resize; only run PDF compress</span>
      </div>

      <label class="text-sm text-gray-700 sm:text-right">maxSizeMB</label>
      <input
        v-model.number="opts.maxSizeMB"
        type="number"
        step="any"
        min="0"
        class="rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
      />

      <label class="text-sm text-gray-700 sm:text-right">maxWidthOrHeight</label>
      <input
        v-model.number="opts.maxWidthOrHeight"
        type="number"
        min="0"
        placeholder="optional"
        class="rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
      />

      <span class="text-sm text-gray-700 sm:text-right">useWebWorker</span>
      <div class="flex items-center">
        <input v-model="opts.useWebWorker" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500" />
      </div>

      <label class="text-sm text-gray-700 sm:text-right">libURL</label>
      <input
        v-model="opts.libURL"
        type="text"
        placeholder="optional"
        class="rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
      />

      <span class="text-sm text-gray-700 sm:text-right">preserveExif</span>
      <div class="flex items-center">
        <input v-model="opts.preserveExif" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500" />
      </div>

      <label class="text-sm text-gray-700 sm:text-right">maxIteration</label>
      <input
        v-model.number="opts.maxIteration"
        type="number"
        min="1"
        class="rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
      />

      <label class="text-sm text-gray-700 sm:text-right">exifOrientation (1-8)</label>
      <input
        v-model.number="opts.exifOrientation"
        type="number"
        min="1"
        max="8"
        placeholder="optional"
        class="rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
      />

      <label class="text-sm text-gray-700 sm:text-right">fileType</label>
      <select v-model="opts.fileType" class="rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500">
        <option value="">default (from file)</option>
        <option value="image/jpeg">image/jpeg</option>
        <option value="image/png">image/png</option>
        <option value="image/webp">image/webp</option>
      </select>

      <label class="text-sm text-gray-700 sm:text-right">initialQuality (0-1)</label>
      <input
        v-model.number="opts.initialQuality"
        type="number"
        step="0.1"
        min="0"
        max="1"
        class="rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
      />

      <span class="text-sm text-gray-700 sm:text-right">alwaysKeepResolution</span>
      <div class="flex items-center">
        <input v-model="opts.alwaysKeepResolution" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500" />
      </div>

      <span class="text-sm text-gray-700 sm:text-right">onProgress (report progress)</span>
      <div class="flex items-center gap-3">
        <input v-model="opts.reportProgress" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500" />
        <span v-if="opts.reportProgress" class="text-sm text-gray-600">Progress: {{ progress }}%</span>
      </div>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { CompressionFormOptions } from '../types/compression'
import { defaultCompressionFormOptions } from '../types/compression'

defineProps<{
  progress: number
}>()

const opts = reactive<CompressionFormOptions>({ ...defaultCompressionFormOptions })

function getOptions(): CompressionFormOptions {
  return { ...opts }
}

defineExpose({ getOptions })
</script>
