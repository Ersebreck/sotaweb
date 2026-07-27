# Sotavento — Pre-ICFES Popular

Sitio web del **Pre-ICFES Popular Sotavento**, un proceso de educación popular y comunitaria que prepara gratuitamente a jóvenes de Ciudad Bolívar y Bosa (Bogotá) para la prueba Saber 11 del ICFES.

El sitio cumple tres funciones: presentar el proceso y su historia, dar acceso a material de estudio por área, y ofrecer un **simulacro interactivo con asistencia de IA** para practicar preguntas reales de exámenes anteriores.

🔗 **Sitio en producción:** https://ersebreck.github.io/sotaweb/

---

## Empezar

Requiere Node.js `>=22.12.0`.

```sh
npm install
npm run dev       # http://localhost:4321/sotaweb/
```

| Comando | Acción |
| :--- | :--- |
| `npm install` | Instala las dependencias |
| `npm run dev` | Levanta el servidor de desarrollo en `localhost:4321` |
| `npm run build` | Genera el sitio estático de producción en `./dist/` |
| `npm run preview` | Sirve el build de `./dist/` localmente, para probar antes de desplegar |
| `npm run astro ...` | Corre comandos del CLI de Astro (`astro check`, `astro add`, etc.) |

> El sitio usa `base: 'sotaweb'` en `astro.config.mjs`, así que en local corre bajo `/sotaweb/`, no en la raíz. Todos los enlaces y rutas de assets internos usan ese prefijo — ver [GUIA.md](./GUIA.md#base-path).

---

## Stack

- **[Astro](https://docs.astro.build)** — sitio estático, sin framework de UI (páginas `.astro` + JS vanilla embebido donde hace falta interactividad, como el simulacro).
- **[Tailwind CSS v4](https://tailwindcss.com)** — vía plugin de Vite, con tokens de tema propios (colores, tipografías) en `src/styles/global.css`.
- **GitHub Pages** — hosting estático, deploy automático con GitHub Actions en cada push a `main` (ver `.github/workflows/`).
- **[Groq](https://groq.com)** — API de inferencia LLM usada en el simulacro para dar pistas y explicaciones (llamadas directas desde el navegador, sin backend propio).

No hay backend ni base de datos: todo el estado (resultados de simulacros, clave de Groq del usuario) vive en `localStorage`.

---

## Estructura del sitio

| Sección | Ruta | Contenido |
| :--- | :--- | :--- |
| Inicio | `/` | Hero, qué es el proceso, sedes con mapa, cronograma del semestre, llamado a voluntariado |
| Proceso | `/proceso` | Historia, marco político-pedagógico (Freire), línea de tiempo 2017→2026, galería, comunicados |
| Estudiantes | `/estudiantes` | Tabs: material de estudio por área / simulacros / inscripción |
| Voluntarixs | `/voluntarixs` | Rol del voluntariado, áreas donde se necesita gente, requisitos, contacto |
| Simulacro | `/simulacro` | Simulacro interactivo de Ciencias Naturales con banco de preguntas reales y asistencia de IA |

Hay una página activa pero sin enlace en la navegación (contenido legado, pendiente de retirar): `/quienes-somos`, reemplazada por `/proceso`.

---

## Documentación

Este README es el punto de entrada. Para más detalle:

- **[GUIA.md](./GUIA.md)** — guía técnica del proyecto: cómo está organizado el código, el modelo de datos del banco de preguntas, el sistema de estilos/identidad visual, cómo funciona la integración con IA, y cómo hacer las tareas más comunes (agregar una página, agregar preguntas, etc.). **Empezá acá si vas a contribuir por primera vez.**
- **[DESARROLLO.md](./DESARROLLO.md)** — identidad visual, estado actual de cada sección y roadmap de fases futuras (banco de preguntas completo, backend, plan de estudio con IA).
- **[PLAN_SIMULACROS.md](./PLAN_SIMULACROS.md)** — auditoría de las fuentes del banco de preguntas (PDFs en `Insumos/`), pipeline de extracción/curación, y la taxonomía de competencias por área.
- **[AGENTS.md](./AGENTS.md)** — notas para agentes de IA/CLI que trabajen en este repo (cómo levantar el server, enlaces a la documentación de Astro).

---

## Estructura del código

```text
/
├── src/
│   ├── pages/         # una ruta por archivo .astro (ver tabla de arriba)
│   ├── layouts/        # Layout.astro — <head>, Nav, Footer, filtro SVG compartido
│   ├── components/     # Nav.astro, Footer.astro
│   ├── data/            # banco de preguntas y taxonomía de competencias, en JSON
│   └── styles/          # global.css — tokens de Tailwind (colores, tipografías)
├── public/
│   ├── images/, fonts/ # assets estáticos servidos tal cual
│   └── docs/             # PDF de la Cartilla 2025 (fuente pública del simulacro)
├── Insumos/             # PDFs fuente del banco de preguntas — NO versionado (ver .gitignore)
└── astro.config.mjs    # site, base path, plugin de Tailwind
```

---

## Despliegue

Cada push a `main` dispara el workflow en `.github/workflows/` que corre `npm run build` y publica `dist/` en GitHub Pages. No hace falta ningún paso manual.

---

## Contacto

- Instagram: [@aguante_popular](https://www.instagram.com/aguante_popular/) · [@sotaventoficial](https://www.instagram.com/sotaventoficial/)
