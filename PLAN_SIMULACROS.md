# Plan — Simulacro real (a partir de los insumos en `Insumos/`)

> Estado: **propuesta, pendiente de aprobación**. No implementar hasta confirmar las secciones marcadas ⚠️.

## 1. Qué hay realmente en `Insumos/` (auditoría de las fuentes)

`Insumos/` no está en git (ver `DESARROLLO.md`), así que este documento es la referencia durable de lo que contienen los PDFs.

| Archivo | Páginas | Contenido real |
|---|---|---|
| `Cartilla 2025 Pre-Icfes Sotavento.pdf` | 82 | **Banco completo de preguntas**, ya organizado por "Componente del saber": Ciencias Sociales y Competencias Ciudadanas (con `Competencia 1/2/3` explícitas: Pensamiento Social, Interpretación y análisis, Pensamiento reflexivo y sistémico) → Física → Biología → Química → Matemáticas (con `Competencia 1: Razonamiento Cuantitativo`, ...) → Inglés → Lectura Crítica. Las preguntas 94/95 que ya están hardcodeadas en `simulacro.astro` (Genética, herencia ligada al X) salen de aquí. |
| `Sesión1simulacro.pdf` | 16 | Simulacro completo "Primera Sesión": Lectura Crítica (preguntas 1–41) + Matemáticas y Razonamiento Cuantitativo (42–92). **Sin** Ciencias Naturales. |
| `Sesion2simulacro.pdf` | 23 | Simulacro completo "Segunda Sesión": Inglés + Ciencias Sociales y Competencias Ciudadanas II. **Sin** Ciencias Naturales tampoco. |
| `PreIcfes Bibliotecario y Popular Sotavento.pdf` | 11 | No es un banco de preguntas — es la presentación institucional del proceso (línea de tiempo, misión, historia). Ya cubierto por `/proceso`. **No aporta a Simulacros.** |

**Hallazgo clave:** el único documento con preguntas de **Ciencias Naturales** (Física, Biología, Química) es la Cartilla 2025. Las sesiones 1 y 2 son simulacros de las otras áreas (Lectura Crítica, Matemáticas, Sociales, Inglés). Si el objetivo inmediato es Ciencias, la Cartilla es la fuente primaria; Sesión 1/2 sirven para expandir a las demás áreas del ICFES en una fase posterior.

**Extracción de texto:** `pdftotext -layout` extrae el texto de forma limpia y confiable en los tres bancos de preguntas (columnas, enunciados y opciones A–D se preservan). No son PDFs escaneados como imagen plana — son documentos con texto real, lo cual simplifica mucho la extracción automatizada.

## 2. El problema de las imágenes

Cada PDF trae figuras incrustadas (gráficos, árboles genealógicos, diagramas de circuitos, tablas, cómics). Analicé la resolución de las imágenes incrustadas en la Cartilla con `pdfimages -list`:

- 171 imágenes incrustadas en total.
- La gran mayoría de las figuras "de contenido" (no íconos de layout) están entre **100×100 y 600×600 px**, muchas alrededor de 250–450 px en su lado mayor — es decir, se van a ver borrosas si se muestran a tamaño grande en una pantalla moderna (retina/4K).
- Solo ~4 imágenes superan 400×400 px con buena densidad.

**Confirma lo que planteás en el issue:** vamos a necesitar un paso de mejora de imagen para las figuras que se usen en preguntas visuales (genética, circuitos, gráficas de física, tablas de datos).

## 3. Pipeline propuesto

### 3.1 Extracción (una vez, semi-manual, no en runtime del sitio)
1. `pdftotext -layout` → texto de cada PDF a un `.txt` de trabajo (ya hecho como prueba de concepto).
2. Parseo por reglas simples: los documentos usan headers consistentes (`Componente del saber: X`, `Competencia N: Y`, `RESPONDA LAS PREGUNTAS N A M DE ACUERDO CON...`, numeración `N.` seguida de 4 opciones `A./B./C./D.`) → separar en preguntas individuales con regex/heurísticas, no con un LLM (más barato, más confiable, reproducible).
3. `pdfimages -png` por página para extraer las figuras que acompañan a cada pregunta; asociarlas a la pregunta correspondiente por número de página (esto sí requiere revisión humana rápida, 1 pasada, porque la asociación imagen↔pregunta no es 100% automática).
4. Guardar todo en `Insumos/` (no versionado) como intermedio, y el resultado final curado en un archivo de datos versionado en `src/` (ver §4).

### 3.2 Mejora de imágenes de baja resolución
- Filtrar automáticamente las imágenes extraídas con lado mayor < ~500px (umbral a validar).
- Pasarlas por un servicio de upscaling (ej. Real-ESRGAN local, o una API de imagen — a decidir según presupuesto/infra ya que el sitio es estático en GitHub Pages sin backend propio).
- Guardar el resultado final en `public/images/simulacro/` con nombre estable (`q-<id>.png`), commiteado al repo (son pocas decenas de imágenes, no un dataset masivo).
- ⚠️ Esto es trabajo manual/semi-asistido por pregunta, no algo que se resuelva con una función en el sitio — se hace una vez como parte de la construcción del banco, no en cada visita de un estudiante.

### 3.3 Clasificación por competencias ⚠️ (necesita definición antes de implementar)
- Ciencias Sociales y Matemáticas **ya vienen etiquetadas** en la Cartilla con su competencia explícita (`Competencia 1/2/3: ...`) → extracción directa, sin ambigüedad.
- **Ciencias Naturales (Física/Biología/Química) NO trae competencia etiquetada en el PDF** — solo el "componente del saber" (la sub-materia). Clasificar cada pregunta en su competencia va a requerir un paso de etiquetado (asistido por IA + revisión humana, ya que es criterio pedagógico).
- El marco oficial del ICFES para Ciencias Naturales define **3** competencias: *Uso comprensivo del conocimiento científico*, *Explicación de fenómenos*, *Indagación*. El issue menciona **4** — necesito que confirmes cuál es la cuarta que querés usar (¿una categoría propia del proceso, tipo "Ciencia, Tecnología y Sociedad"? ¿o contás las 3 sub-materias + una transversal?) antes de fijar el esquema de datos y hacer el etiquetado, porque cambiar la taxonomía después implica re-etiquetar todo el banco.
- Objetivo de negocio de esto (según el issue): poder agregar resultados por competencia para identificar en qué está fallando cada estudiante → esto también define qué necesitamos guardar en el historial de resultados (no solo si acertó, sino su competencia).

### 4. Modelo de datos propuesto
Reemplazar el array `PREGUNTAS` hardcodeado en `simulacro.astro` por un banco de preguntas en JSON, versionado en `src/data/`:

```jsonc
// src/data/preguntas-ciencias.json
{
  "id": "cn-094",
  "materia": "ciencias-naturales",
  "componente": "biologia",       // fisica | biologia | quimica
  "competencia": "explicacion-de-fenomenos", // ⚠️ pendiente definir taxonomía final
  "fuente": "cartilla-2025",
  "contexto": { "texto": "...", "imagen": "/sotaweb/images/simulacro/cn-094-ctx.png" },
  "enunciado": "...",
  "opciones": ["...", "...", "...", "..."],
  "correcta": 3,
  "explicacion": "..."
}
```

Esto habilita, sin backend (sigue siendo estático + localStorage como ya está en el roadmap Fase 2/3 de `DESARROLLO.md`):
- Selección de área/materia antes de empezar (ya está en el roadmap).
- Selección aleatoria de N preguntas por sesión, con muestreo balanceado por competencia.
- Guardar en `localStorage` el resultado por competencia → pantalla de resultados que muestra fortalezas/debilidades por competencia, no solo el score total (esto es lo que pide el issue: "identificar dónde están fallando los pelados").

### 5. Fases de implementación

1. **Fase A (este documento):** plan + auditoría de fuentes. ✅ hecho.
2. **Fase B — Ciencias Naturales primero** (foco del issue): extraer y curar el banco de Física/Biología/Química de la Cartilla, definir taxonomía de competencias (⚠️ bloqueado por tu confirmación), mejorar imágenes de baja resolución, migrar `simulacro.astro` de array hardcodeado a `src/data/preguntas-ciencias.json` + selector de N preguntas aleatorias con tracking por competencia en resultados.
3. **Fase C — Resto de áreas:** repetir el pipeline con Sesión 1 (Lectura Crítica, Matemáticas) y Sesión 2 (Inglés, Sociales), que ya vienen con competencias explícitas en el PDF así que el etiquetado es mecánico, no manual.
4. **Fase D:** selector de área/materia en pantalla de inicio (ya en roadmap Fase 2 de `DESARROLLO.md`).

## 6. Preguntas abiertas para vos (bloquean Fase B)

1. **Taxonomía de competencias de Ciencias:** ¿cuáles son las 4 competencias exactas que querés usar? (el ICFES oficial define 3 — necesito la cuarta o el criterio de split).
2. **Servicio de upscaling de imágenes:** ¿tenés preferencia/presupuesto para una API de imagen (ej. Replicate/Real-ESRGAN hosted), o preferís que use una herramienta local/gratuita aunque el resultado sea más limitado?
3. **Alcance de esta iteración:** ¿arrancamos solo con Ciencias Naturales (como pide el issue) y dejamos Sesión 1/2 para después, o preferís que arranque el pipeline genérico para las 6 áreas de una?
