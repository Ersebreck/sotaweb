# Plan — Simulacro real (a partir de los insumos en `Insumos/`)

> Estado: **aprobado (confirmación aceptada sin respuestas textuales a las 3 preguntas de la sección 6)**. Fase B arrancó con decisiones documentadas por defecto — ver sección 6 actualizada. `simulacro.astro` ya consume `src/data/preguntas-ciencias.json` en vez del array hardcodeado; el banco tiene **45 de las 49 preguntas** de Ciencias Naturales (Física/Biología/Química) de la Cartilla 2025, curadas y etiquetadas con `componente` y `competencia` (ver BIO-10). Quedan 4 preguntas pendientes (68, 70, 71, 73) delegadas al pipeline de imágenes (BIO-11) — ver §3.1 actualizado.

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

**Actualización (BIO-10):** `pdftotext -layout` confirmó el problema de columnas intercaladas anticipado en el issue (ej. preguntas 71/72 mezclan sus opciones entre columnas). En vez de parsear el `.txt` con regex, se resolvió renderizando cada página a imagen (`pdftoppm -png -r 150`) y leyéndola directamente — esto además permitió leer gráficas, tablas, circuitos y diagramas que el texto plano no captura, y resolver correctamente casos donde el texto de una pregunta queda mezclado con el de la vecina (confirmado en 71/72: la Q72 sobre resonancia de la guitarra tiene su enunciado en la columna izquierda pero sus 4 opciones aparecen en la columna derecha, alineadas con la Q71). De las 46 preguntas restantes (58-106, salvo 94/95/105 ya migradas), se curaron **42** con confianza alta (respuesta verificada por texto y/o por lectura directa de la figura); **4 quedaron pendientes** por depender de comparar 4 diagramas gráficos casi idénticos donde un error de lectura es fácil y costoso de cometer:
- **68** (identificar cuál de 4 diagramas de flujo de calor representa correctamente una máquina térmica — las 4 variantes solo se diferencian por la dirección de flechas Qc/Qf/Energía, muy sensible a mala lectura).
- **70** (identificar cuál de 4 diagramas de vectores de fuerza eléctrica es el correcto, dado un triángulo de 3 cargas).
- **71** (identificar cuál de 4 gráficas de onda representa la longitud de onda de la luz en vidrio/agua/aire).
- **73** (asociar una gráfica de energía potencial con uno de 4 modelos de montaña rusa dibujados a mano, muy pequeños).

Estas 4 quedan documentadas aquí y delegadas a BIO-11 (pipeline de mejora de imágenes), que ya existe como issue hija: al mejorar la resolución de estas figuras se vuelve mucho más seguro verificarlas (o delegarlas a revisión humana con la imagen en buena calidad). Para las preguntas que sí se incluyeron y que originalmente tenían tablas de datos, gráficas o diagramas (ej. 58, 60-66, 78-93, 98-104, 106), la figura se convirtió en una **descripción textual dentro del enunciado o del contexto** (equivalente a un texto alternativo accesible) en vez de depender de una imagen — esto las deja utilizables de inmediato; BIO-11 puede añadir después la imagen real como refuerzo visual sin cambiar la pregunta.

### 3.2 Mejora de imágenes de baja resolución
- Filtrar automáticamente las imágenes extraídas con lado mayor < ~500px (umbral a validar).
- Pasarlas por un servicio de upscaling (ej. Real-ESRGAN local, o una API de imagen — a decidir según presupuesto/infra ya que el sitio es estático en GitHub Pages sin backend propio).
- Guardar el resultado final en `public/images/simulacro/` con nombre estable (`q-<id>.png`), commiteado al repo (son pocas decenas de imágenes, no un dataset masivo).
- ⚠️ Esto es trabajo manual/semi-asistido por pregunta, no algo que se resuelva con una función en el sitio — se hace una vez como parte de la construcción del banco, no en cada visita de un estudiante.

### 3.3 Clasificación por competencias — ✅ decisión tomada (default documentado, no confirmado por texto)
- Ciencias Sociales y Matemáticas **ya vienen etiquetadas** en la Cartilla con su competencia explícita (`Competencia 1/2/3: ...`) → extracción directa, sin ambigüedad.
- **Ciencias Naturales (Física/Biología/Química) NO trae competencia etiquetada en el PDF** — solo el "componente del saber" (la sub-materia). Clasificar cada pregunta en su competencia requiere un paso de etiquetado (asistido por IA + revisión humana, ya que es criterio pedagógico).
- **Taxonomía adoptada** (`src/data/competencias.json`): las 3 competencias oficiales del ICFES para Ciencias Naturales (*Uso comprensivo del conocimiento científico*, *Explicación de fenómenos*, *Indagación*) + una cuarta, **"Ciencia, Tecnología y Sociedad"**, tomada directamente del encabezado temático que trae la propia Cartilla 2025 antes de las preguntas 94-96 (pág. 35: "HERENCIA Y METODOLOGÍA DE LA INVESTIGACIÓN CIENCIA, TECNOLOGÍA Y SOCIEDAD"). No es una categoría inventada — viene de la fuente.
- La confirmación del plan fue **aceptada** en el hilo del issue, pero sin responder por texto las 3 preguntas abiertas (taxonomía, upscaling, alcance). Ante eso, se procedió con esta decisión documentada y reversible: el archivo `src/data/competencias.json` centraliza la taxonomía, así que cambiarla no implica tocar el código de `simulacro.astro`, solo re-etiquetar el campo `competencia` de cada pregunta en `preguntas-ciencias.json` (o el equivalente cuando exista el banco completo).
- El resultado del simulacro ya muestra desempeño por competencia (barras en pantalla de resultados) cuando hay más de una competencia entre las preguntas mostradas — esto es lo que pide el issue para "identificar dónde están fallando los pelados".

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
2. **Fase B — Ciencias Naturales primero** (foco del issue): extraer y curar el banco de Física/Biología/Química de la Cartilla ✅ **45 de 49 preguntas curadas (BIO-10)**, definir taxonomía de competencias ✅ hecho, mejorar imágenes de baja resolución (pendiente, BIO-11), migrar `simulacro.astro` de array hardcodeado a `src/data/preguntas-ciencias.json` ✅ hecho + selector de N preguntas aleatorias con tracking por competencia en resultados ✅ hecho.
3. **Fase C — Resto de áreas:** repetir el pipeline con Sesión 1 (Lectura Crítica, Matemáticas) y Sesión 2 (Inglés, Sociales), que ya vienen con competencias explícitas en el PDF así que el etiquetado es mecánico, no manual.
4. **Fase D:** selector de área/materia en pantalla de inicio (ya en roadmap Fase 2 de `DESARROLLO.md`).

## 6. Preguntas abiertas — estado tras la confirmación aceptada sin respuesta textual

1. ~~**Taxonomía de competencias de Ciencias**~~ → **resuelto con default documentado** (ver §3.3): 3 competencias ICFES + "Ciencia, Tecnología y Sociedad" tomada de la propia Cartilla. Reversible vía `src/data/competencias.json` si preferís otra.
2. **Servicio de upscaling de imágenes:** sigue sin definir. No se llamó a ningún servicio de pago sin autorización explícita. Delegado a issue hija (pipeline de imágenes) — se implementará el resto del pipeline (extracción, filtrado <500px) dejando el paso de upscaling como TODO explícito hasta que se confirme presupuesto/servicio.
3. **Alcance de esta iteración:** se interpretó como **Ciencias Naturales primero**, tal como pide el issue original ("Sciences have 4 competences"). Sesión 1/2 (Lectura Crítica, Matemáticas, Inglés, Sociales) quedan para una fase posterior, ya explícitamente fuera del foco del issue.
