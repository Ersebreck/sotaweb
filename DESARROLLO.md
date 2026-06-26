# Ruta de desarrollo — Sitio web Pre-ICFES Sotavento

## Stack
- **Framework:** Astro (static output)
- **Estilos:** Tailwind CSS v4
- **Hosting:** GitHub Pages (portable a Netlify/Vercel cuando se necesite backend)
- **Idioma:** Español
- **Deploy:** GitHub Actions automático en cada push a `main`

---

## Identidad visual
- **Colores:** verde oliva/khaki (`#8A8A50`), crema (`#EDE8DC`), carbón oscuro (`#1C1C28`)
- **Tipografía:** Cormorant Garamond (display), Inter (cuerpo), The Jacatra (etiquetas/subtítulos)
- **Fuente especial:** The Jacatra — fuente graffiti/burbuja con relleno oliva via filtro SVG `feMorphology`
- **Imágenes clave:** posters tipo mural latinoamericano (cientificas, poetas, ingenierxs), fotografías de barrio
- **Favicon:** emoji 📖 como SVG en todas las páginas
- **Tono:** comunitario, cálido, con carácter político popular

---

## Estructura del sitio (actual)

| Sección | Ruta | Estado |
|---|---|---|
| Inicio | `/` | ✓ — hero, qué es, sedes con mapas, cronograma semestre, CTA voluntarixs |
| Proceso | `/proceso` | ✓ — historia, marco político, Freire, línea de tiempo 2017→2026, galería, comunicados |
| Estudiantes | `/estudiantes` | ✓ — tabs: contenido por área / simulacros / inscripción |
| Voluntarixs | `/voluntarixs` | ✓ — rol, áreas, requisitos, contacto |
| Simulacro | `/simulacro` | ✓ demo — 2 preguntas reales (Cartilla 2025 #94 y #95), timer, hints IA via Groq |

### Páginas legacy (activas pero sin link en nav)
- `/quienes-somos` — reemplazada por `/proceso`
- `/contenido` — reemplazada por `/estudiantes`

---

## Sistema de IA (demo actual)
- **Proveedor:** Groq (free tier) — llamadas directas desde el browser, sin backend
- **Modelo:** `llama-3.3-70b-versatile`
- **Clave:** hardcodeada (ofuscada) para el demo — a reemplazar por sistema de clave propia del usuario
- **Streaming:** sí — respuestas aparecen token a token
- **Acciones disponibles:** "¿Qué me pregunta?", "Dame una pista", "Explicá la respuesta", plan de estudio en resultados

---

## Roadmap

### Fase 2 — Simulacro completo
- [ ] Banco de preguntas por área (todas las 6 áreas del ICFES)
- [ ] Preguntas reales de la Cartilla Sotavento
- [ ] Sistema de "trae tu propia clave Groq"
- [ ] Selección de área antes de empezar
- [ ] Historial de resultados en localStorage

### Fase 3 — Backend (requiere salir de GitHub Pages → Vercel/Netlify)
- [ ] Base de datos de preguntas (Supabase)
- [ ] Cuentas de usuario simples
- [ ] Tracking de progreso por área
- [ ] Plan de estudio personalizado post-simulacro

### Fase 4 — Plan personalizado con IA
- [ ] Análisis de historial → áreas débiles
- [ ] Plan semanal generado por IA
- [ ] Mini-simulacros dentro del contenido por área

### Pendiente / ideas
- [ ] Formulario de inscripción de estudiantes (Google Form embebido por ahora)
- [ ] Galería con fotos reales del proceso
- [ ] Comunicados y convocatorias (sección `/proceso`)
- [ ] Cronograma del semestre con fechas reales
- [ ] Eliminar páginas legacy (`/quienes-somos`, `/contenido`)

---

## Convenciones del proyecto
- Rutas de assets con prefijo `/sotaweb/` (por el `base` config de Astro)
- Imágenes en `public/images/`, fuentes en `public/fonts/`
- Carpeta `Insumos/` ignorada por git (material fuente, no para deploy)
- Nav refleja la estructura por audiencia: Proceso / Estudiantes / Voluntarixs
- Mobile-first, Tailwind utility classes
