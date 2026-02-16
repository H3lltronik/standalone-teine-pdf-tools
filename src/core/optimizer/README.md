# Optimizador de PDF por tamaño objetivo

Este directorio contiene el algoritmo que reduce un PDF hasta un **tamaño objetivo** (en bytes), probando distintos niveles de compresión y eligiendo el que mejor se acerca al objetivo sin hacer demasiadas iteraciones.

---

## Objetivo del algoritmo

Dado un PDF de tamaño **inicial** y un **tamaño objetivo**, el algoritmo encuentra **qué tan “agresiva” debe ser la compresión** para que el resultado quede en (o lo más cerca de) ese objetivo, **sin hacer cientos de pruebas**.

El optimizador recibe el buffer original, el target en bytes y opciones; el techo de agresividad se fija en el constructor:

```ts
// pdf-size-target-optimizer.ts — constructor
constructor(
  private readonly pdfOptimizer: PDFOptimizer,
  private readonly initialBuffer: ArrayBuffer,
  private readonly targetSizeBytes: number,
  options: PdfSizeTargetOptimizerOptions = {}
) {
  this.high = maxAggressionForRatio(targetSizeBytes, initialBuffer.byteLength)
  this.maxIterations = options.maxIterations ?? 5
  this.toleranceRatio = options.toleranceRatio ?? 0.1
  this.intervalEpsilon = options.intervalEpsilon ?? 0.05
}
```

---

## Idea central: la “agresividad”

La compresión se controla con un único número entre 0 y 1: la **agresividad**. En el código es el valor que devuelve `getNextAggression()` y que se pasa a `aggressionToImageOptions` y `aggressionToPdfOptions`.

| Agresividad | Efecto |
|-------------|--------|
| **0** | Compresión suave: se mantiene calidad y resolución; el PDF se reduce poco. |
| **1** | Compresión fuerte: baja calidad y resolución; el PDF se reduce mucho. |

El estado interno guarda los límites y la última agresividad probada:

```ts
// pdf-size-target-optimizer.ts — estado de la búsqueda
private iteration = 0
private low = 0
private high: number
private lastAggression = 0.5
private lastSizeBytes: number = Infinity
```

El algoritmo no sabe de antemano qué agresividad produce exactamente el tamaño deseado. Por eso **prueba** varias agresividades y **ajusta** `low`/`high` según si el resultado quedó por encima o por debajo del objetivo.

---

## Paso 1: Acotar el rango según el pedido

Antes de buscar, se calcula **hasta qué agresividad tiene sentido probar** con `maxAggressionForRatio`: ratio = objetivo / inicial, techo = 1 − ratio, acotado a `[MIN_HIGH_AGGRESSION, 1]`.

```ts
// pdf-size-target-optimizer.ts
const MIN_HIGH_AGGRESSION = 0.05

function maxAggressionForRatio(targetSizeBytes: number, initialSizeBytes: number): number {
  if (initialSizeBytes <= 0) return 1
  const ratio = targetSizeBytes / initialSizeBytes
  const high = 1 - ratio
  return Math.min(1, Math.max(MIN_HIGH_AGGRESSION, high))
}
```

Ese valor se asigna a `this.high` en el constructor:

```ts
this.high = maxAggressionForRatio(targetSizeBytes, initialBuffer.byteLength)
```

Ejemplos:

| Caso | Ratio | Máx. agresividad (`this.high`) |
|------|--------|--------------------------------|
| 4 MB → 2 MB | 0,5 | **0,5** (no se prueba 1, se evita sobrecomprimir). |
| 4 MB → 3,9 MB | ~0,975 | **0,05** (solo compresión muy suave). |
| 50 MB → 1 KB | ~0 | **1** (se permite toda la agresividad). |

Así el algoritmo solo busca dentro de un **rango útil** `[0, this.high]`.

---

## Paso 2: Traducir agresividad a parámetros

Ese número se convierte en parámetros concretos para imágenes y PDF. Se usa una interpolación lineal (`lerp`) entre valores “suaves” (t=0) y “agresivos” (t=1):

```ts
// pdf-size-target-optimizer.ts
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}
```

**Imágenes (cada página):** calidad JPEG, tamaño máximo en píxeles, maxSizeMB.

```ts
// pdf-size-target-optimizer.ts — aggressionToImageOptions
function aggressionToImageOptions(aggression: number): ImageCompressionOptions {
  const t = Math.max(0, Math.min(1, aggression))
  const maxDim = Math.round(lerp(2400, 200, t))
  return {
    maxSizeMB: lerp(0.6, 0.02, t),
    quality: lerp(0.92, 0.12, t),
    maxWidth: maxDim,
    maxHeight: maxDim,
  }
}
```

**PDF final:** calidad JPEG embebida, DPI, preset (lossless / balanced / max).

```ts
// pdf-size-target-optimizer.ts — aggressionToPdfOptions
function aggressionToPdfOptions(aggression: number): PdfCompressionOptions {
  const t = Math.max(0, Math.min(1, aggression))
  const preset: PdfCompressionOptions['preset'] =
    t <= 0.35 ? 'lossless' : t <= 0.7 ? 'balanced' : 'max'
  return {
    jpegQuality: lerp(0.9, 0.2, t),
    targetDPI: Math.round(lerp(150, 72, t)),
    preserveMetadata: false,
    preset,
  }
}
```

A mayor agresividad → menor calidad y resolución → archivo más pequeño. A menor agresividad → mejor calidad → archivo más grande.

---

## Paso 3: Búsqueda binaria sobre la agresividad

En cada iteración se elige una agresividad, se comprime **siempre una copia del mismo PDF original** y se actualiza `low` o `high` según el tamaño obtenido.

### 3.1 Usar siempre el original (una copia)

Para que la búsqueda binaria sea sobre “compress(original, A)”, cada prueba recibe una **copia** del buffer inicial (evitando buffers detached por pdf.js):

```ts
// pdf-size-target-optimizer.ts — getCurrentBuffer
private getCurrentBuffer(): ArrayBuffer {
  return this.initialBuffer.slice(0)
}
```

### 3.2 Elegir la próxima agresividad: `getNextAggression()`

- **Iteración 0:** se devuelve **0** (mínima agresividad).
- **Iteración 1:** se devuelve **this.high** (techo calculado en el paso 1).
- **Iteraciones 2, 3, …:** se devuelve el **punto medio** entre `low` y `high`; si el intervalo es menor que `intervalEpsilon` o se alcanza `maxIterations`, se devuelve `null` y se termina.

```ts
// pdf-size-target-optimizer.ts — getNextAggression
getNextAggression(): number | null {
  if (this.done) return null
  if (this.iteration >= this.maxIterations || this.lastSizeBytes <= this.targetSizeBytes) {
    this.done = true
    return null
  }
  if (this.iteration === 0) {
    this.iteration++
    this.lastAggression = 0
    return 0
  }
  if (this.iteration === 1) {
    this.iteration++
    this.lastAggression = this.high
    return this.high
  }
  const mid = (this.low + this.high) / 2
  if (this.high - this.low < this.intervalEpsilon) {
    this.done = true
    return null
  }
  this.iteration++
  this.lastAggression = mid
  return mid
}
```

### 3.3 Actualizar límites según el tamaño: `updateLastResult()`

- Si el tamaño es **≤ objetivo**: se guarda el PDF, se actualiza `this.high = lastAggression` (ya tenemos una agresividad que cumple; podemos probar menos). Opcionalmente se marca `done` si estamos dentro de la tolerancia.
- Si el tamaño es **> objetivo**: se actualiza `this.low = lastAggression` (hace falta más agresividad). Solo se sobrescribe `pdfFile` si aún no teníamos ningún resultado bajo el objetivo (así no perdemos el mejor intento previo).

```ts
// pdf-size-target-optimizer.ts — updateLastResult
updateLastResult(pdf: PdfFile): void {
  const size = pdf.getArrayBuffer().byteLength
  const hadUnderTarget =
    this.lastSizeBytes !== Infinity && this.lastSizeBytes <= this.targetSizeBytes

  if (size <= this.targetSizeBytes) {
    this.pdfFile = pdf
    this.lastSizeBytes = size
    this.high = this.lastAggression
    const toleranceBytes = this.targetSizeBytes * this.toleranceRatio
    if (size >= this.targetSizeBytes - toleranceBytes) this.done = true
  } else {
    this.low = this.lastAggression
    if (!hadUnderTarget) {
      this.pdfFile = pdf
      this.lastSizeBytes = size
    }
  }
}
```

### 3.4 Bucle principal: `process()`

El bucle pide la siguiente agresividad, comprime el PDF (copia del original) con esa agresividad y actualiza el resultado hasta que `getNextAggression()` devuelve `null`:

```ts
// pdf-size-target-optimizer.ts — process
async process(params?: { onProgress?: (p: number) => void }): Promise<PdfFile> {
  const onProgress = params?.onProgress
  const totalTimer = new TaskTimer()
  let iterationIndex = 0

  while (!this.done) {
    const aggression = this.getNextAggression()
    if (aggression === null) break

    const iterTimer = new TaskTimer()
    const imageOptions = aggressionToImageOptions(aggression)
    const pdfOptions = aggressionToPdfOptions(aggression)
    const pdf = await this.pdfOptimizer.compress(
      this.getCurrentBuffer(),
      imageOptions,
      pdfOptions,
      onProgress
    )
    this.updateLastResult(pdf)
    // ... logging, iterationIndex++
  }
  // ...
  return this.pdfFile
}
```

Criterios de parada (vistos en `getNextAggression` y `updateLastResult`):

- El tamaño está **≤ objetivo** (y opcionalmente dentro de la tolerancia).
- Se llega al **máximo de iteraciones** (`maxIterations`).
- El intervalo **`high - low < intervalEpsilon`**.

---

## Paso 4: Resultado que se devuelve

- Si en alguna prueba el tamaño quedó **≤ objetivo**: ese PDF se guarda en `this.pdfFile` y se sigue afinando hacia **menos** agresividad (`high = lastAggression`). El resultado final es el **mejor PDF que cumplió el objetivo** (el de menor agresividad que aún está bajo el target).
- Si **nunca** se llegó al objetivo: no se sobrescribe `pdfFile` cuando el nuevo intento queda por encima y ya teníamos uno por debajo; si todos quedaron por encima, se mantiene el último (el más pequeño logrado). Al final se devuelve `this.pdfFile`:

```ts
// pdf-size-target-optimizer.ts — final de process
if (!this.pdfFile) {
  throw new Error('PdfSizeTargetOptimizer: no result (maxIterations may be 0)')
}
return this.pdfFile
```

---

## Resumen en una frase

El algoritmo **acota el rango de agresividad** con `maxAggressionForRatio` según tu pedido de tamaño, **prueba** unas pocas agresividades sobre **copias del mismo PDF original** (`getCurrentBuffer`) con búsqueda binaria (`getNextAggression` + `updateLastResult`), y devuelve el PDF que **queda en el objetivo (o lo más cerca posible)** con la **menor compresión necesaria** para lograrlo.

---

## Archivos del directorio

| Archivo | Rol |
|---------|-----|
| `pdf-size-target-optimizer.ts` | Búsqueda binaria de agresividad y orquestación del proceso. |
| `pdf-optimizer.ts` | Un solo paso de compresión: PDF → páginas → imágenes comprimidas → PDF reconstruido y comprimido. |
