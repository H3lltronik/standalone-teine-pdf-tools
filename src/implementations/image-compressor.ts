import imageCompression, { type Options } from 'browser-image-compression'
import type { IImageCompressor, ImageCompressionOptions, ImageFile } from '../core/types'
import { getLoggerFor } from '../lib/logger'
import { PromisePool } from '../lib/promise-pool'

const log = getLoggerFor('image-compressor')

const DEFAULT_POOL_CONCURRENCY = 3;

async function getImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(blob);
  const width = bitmap.width;
  const height = bitmap.height;
  bitmap.close();
  return { width, height };
}

export class ImageCompressor implements IImageCompressor {
    private readonly pool: PromisePool;

    constructor(concurrency: number = DEFAULT_POOL_CONCURRENCY) {
        this.pool = new PromisePool(concurrency);
    }

    async compress(images: ImageFile[], options: ImageCompressionOptions, onProgress?: (p: number) => void): Promise<ImageFile[]> {
        return this.pool.map(images, async (image) => {
            const file = new File([image.data], image.name, { type: image.mimeType });
            const params: Options = {
                maxSizeMB: options.maxSizeMB,
                useWebWorker: true,
                initialQuality: options.quality,
                fileType: image.mimeType,
                maxWidthOrHeight: options.maxWidth ?? options.maxHeight,
                alwaysKeepResolution: true,
            }

            log.info('Compressing image with params: {params}', { params })

            const compressedFile = await imageCompression(file, {
                ...params,
                onProgress: onProgress
            });
            const { width, height } = await getImageDimensions(compressedFile);
            return {
                name: compressedFile.name,
                mimeType: compressedFile.type,
                data: await compressedFile.arrayBuffer(),
                width,
                height,
            };
        }, (index, durationMs) => {
            const ms = Math.round(durationMs * 10) / 10
            log.debug`Image ${index} compressed in ${ms}ms`
        });
    }
}