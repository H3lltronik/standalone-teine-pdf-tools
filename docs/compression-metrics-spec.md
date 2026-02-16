# Especificación de métricas de compresión PDF

Objetivo: guardar información de cada compresión para **performance** y **mejora futura del algoritmo** (tamaño, metadatos del PDF, parámetros del optimizador de imágenes, del optimizador PDF y del bucle de búsqueda).

---

## 1. Flujo analizado

```
Compression.vue (runBatchThenDownload)
    → useCompressionBatch.runBatch()
        → Por cada archivo:
            ArrayBufferFetcher.fromFileSource(file.source)
            targetBytes = fileWeightUtils.targetWeightToBytes(file.targetWeight)
            PdfSizeTargetOptimizer(pdfOptimizer, arrayBuffer, targetBytes, OPTIMIZER_OPTIONS)
            → targetOptimizer.process()
                → Bucle: getNextAggression() → aggressionToImageOptions / aggressionToPdfOptions
                    → pdfOptimizer.compress(buffer, imageOptions, pdfOptions)
                        → pdfReader.load → getPages()
                        → Por cada página: render(maxWidth, maxHeight) → imageCompressor.compress(image, imgOpts)
                        → pdfWriter → pdfCompressor.compress(buffer, pdfOpts)
                    → updateLastResult(pdf)
            → store.setFileOptimizedBlob(file.id, blob)
```

- **Entrada por archivo:** `file` (id, name, sizeBytes, targetWeight, source).
- **Constantes del optimizador:** `maxIterations: 5`, `toleranceRatio: 0.1`, `intervalEpsilon: 0.05`.
- **Por iteración del bucle:** `aggression` → `ImageCompressionOptions` (maxSizeMB, quality, maxWidth, maxHeight) y `PdfCompressionOptions` (jpegQuality, targetDPI, preserveMetadata, preset).

---

## 2. Datos con más valor (recomendados)

### 2.1 Por compresión (un registro por archivo comprimido)

| Campo | Tipo | Origen | Valor para el algoritmo |
|-------|------|--------|-------------------------|
| `initial_size_bytes` | number | `arrayBuffer.byteLength` o `file.sizeBytes` | Tamaño original. |
| `target_size_bytes` | number | `targetBytes` (targetWeight → bytes) | Objetivo de tamaño. |
| `final_size_bytes` | number | `resultPdf.getArrayBuffer().byteLength` o `blob.size` | Resultado real. |
| `size_ratio` | number | `final_size_bytes / initial_size_bytes` | Ratio de compresión logrado. |
| `target_achieved` | boolean | `final_size_bytes <= target_size_bytes` | Si se cumplió el objetivo. |
| `total_duration_ms` | number | `PdfSizeTargetOptimizer.getLastProcessDurationMs()` | Tiempo total de optimización. |
| `page_count` | number | `pdf.numPages` (al cargar con reader) | Complejidad del documento. |
| `iterations_used` | number | Contador en `process()` del size-target optimizer | Cuántos pasos de búsqueda. |
| `final_aggression` | number | `PdfSizeTargetOptimizer.getLastAggression()` | Parámetro de agresividad final. |
| `optimizer_options` | object | Constantes en `useCompressionBatch` | Reproducibilidad: `maxIterations`, `toleranceRatio`, `intervalEpsilon`. |

**Metadatos del PDF (si se exponen):** número de páginas es el más útil; el resto (autor, título, etc.) es opcional y de menor prioridad para el algoritmo.

---

### 2.2 Por iteración del bucle (dentro de `PdfSizeTargetOptimizer.process()`)

Cada paso de la búsqueda binaria es clave para entender qué combinación de parámetros lleva a qué tamaño.

| Campo | Tipo | Origen | Valor para el algoritmo |
|-------|------|--------|-------------------------|
| `iteration_index` | number | Índice 0-based en el bucle | Orden del paso. |
| `aggression` | number | `getNextAggression()` | Punto del espacio de búsqueda. |
| `image_options` | object | `aggressionToImageOptions(aggression)` | Parámetros enviados al compresor de imágenes. |
| `pdf_options` | object | `aggressionToPdfOptions(aggression)` | Parámetros enviados al compresor PDF. |
| `result_size_bytes` | number | `pdf.getArrayBuffer().byteLength` tras esa iteración | Curva tamaño vs aggression. |
| `iteration_duration_ms` | number | `iterTimer.elapsedMs()` en cada iteración | Coste por paso. |

**Estructura sugerida de `image_options` / `pdf_options` (snapshot de lo que se envía):**

- **image_options:** `{ maxSizeMB, quality, maxWidth, maxHeight }` (ya definidos en `ImageCompressionOptions`).
- **pdf_options:** `{ jpegQuality, targetDPI, preserveMetadata, preset }` (ya en `PdfCompressionOptions`).

Con esto se puede analizar después: para un mismo PDF y target, qué aggression y qué opciones dieron cada tamaño y tiempo.

---

### 2.3 Opcional: agregados por página (para afinar el modelo)

En `PDFOptimizer.compress()` ya se miden por página:

- `renderMs`, `compressMs`, `totalMs`
- `image.data.byteLength` (antes de comprimir), `compressed?.data.byteLength` (después)

Para no saturar eventos, se puede:

- Guardar **solo a nivel de compresión**: `total_render_ms`, `total_compress_images_ms`, `sum_input_image_bytes`, `sum_compressed_image_bytes`, o
- Guardar **una muestra** (p. ej. primera, última, alguna intermedia) en lugar de todas las páginas.

Prioridad menor que 2.1 y 2.2; útil para detectar páginas muy pesadas o desbalanceos.

---

## 3. Resumen de prioridad

1. **Alta (por compresión):** `initial_size_bytes`, `target_size_bytes`, `final_size_bytes`, `size_ratio`, `target_achieved`, `total_duration_ms`, `page_count`, `iterations_used`, `final_aggression`, `optimizer_options`.
2. **Alta (por iteración):** `iteration_index`, `aggression`, `image_options`, `pdf_options`, `result_size_bytes`, `iteration_duration_ms`.
3. **Media (metadatos):** `page_count`; el resto de metadatos PDF es opcional.
4. **Baja (por página):** agregados o muestra de tiempos y tamaños de imágenes por página.

---

## 4. Dónde capturar cada cosa

| Dato | Dónde |
|------|--------|
| initial_size_bytes, target_size_bytes, page_count | `useCompressionBatch.runBatch()` (al tener `arrayBuffer` y antes/después de crear el optimizer; page_count requiere cargar el PDF una vez o exponerlo desde el optimizer). |
| final_size_bytes, total_duration_ms, iterations_used, final_aggression | Tras `targetOptimizer.process()` en `useCompressionBatch`; el optimizer ya tiene o puede exponer estos valores. |
| Por iteración (aggression, image_options, pdf_options, result_size_bytes, iteration_duration_ms) | Dentro de `PdfSizeTargetOptimizer.process()`, en cada vuelta del `while`. |
| optimizer_options | Constantes en `useCompressionBatch` (o pasadas al constructor del optimizer). |

Un único “evento” o registro de métricas por compresión puede incluir el resumen (2.1) más un array de iteraciones (2.2), y opcionalmente agregados de página (2.3).
