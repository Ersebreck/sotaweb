# Guía del proyecto

Guía técnica para quien empieza a trabajar en este repo. Si es tu primera vez acá, leé esto antes de tocar código. Para la visión general y cómo correr el sitio, ver [README.md](./README.md).

## Índice

1. [Cómo está armado el sitio](#cómo-está-armado-el-sitio)
2. [Base path](#base-path)
3. [Identidad visual y estilos](#identidad-visual-y-estilos)
4. [El simulacro](#el-simulacro)
5. [Modelo de datos del banco de preguntas](#modelo-de-datos-del-banco-de-preguntas)
6. [Asistencia de IA (Groq)](#asistencia-de-ia-groq)
7. [Tareas comunes](#tareas-comunes)
8. [Convenciones](#convenciones)
9. [Dónde seguir leyendo](#dónde-seguir-leyendo)

---

## Cómo está armado el sitio

Es un sitio **Astro** estático, sin framework de UI (nada de React/Vue) y sin backend. Cada `.astro` en `src/pages/` es una ruta. La única página con lógica no trivial es `src/pages/simulacro.astro`, que tiene un bloque `<script>` de JS vanilla que maneja el quiz completo (estado, timer, llamadas a la IA, resultados).

```
src/
├── layouts/Layout.astro     # <head> común, fuentes, filtro SVG de la tipografía Jacatra, monta Nav + Footer
├── components/
│   ├── Nav.astro             # navegación superior, resalta la ruta activa, menú mobile
│   └── Footer.astro          # sedes, contacto, redes
├── pages/
│   ├── index.astro           # Inicio
│   ├── proceso.astro         # Proceso (historia, línea de tiempo)
│   ├── estudiantes.astro     # Estudiantes (tabs: contenido / simulacros / inscripción)
│   ├── voluntarixs.astro     # Voluntarixs
│   ├── simulacro.astro       # Simulacro interactivo — ver sección dedicada abajo
│   └── quienes-somos.astro   # legado, sin link en Nav, reemplazada por proceso.astro
├── data/
│   ├── competencias.json     # taxonomía de competencias por materia (ICFES)
│   └── preguntas-ciencias.json  # banco de preguntas de Ciencias Naturales
└── styles/global.css         # tokens de Tailwind (colores, tipografías)
```

Todas las páginas usan el mismo `Layout.astro`, que recibe `title`, `description` y opcionalmente `favicon` como props.

## Base path

`astro.config.mjs` define `base: 'sotaweb'`, porque el sitio se despliega en `https://ersebreck.github.io/sotaweb/` (un subpath, no la raíz de un dominio propio). Esto significa:

- **Todo enlace interno y toda ruta de asset debe llevar el prefijo `/sotaweb/`** escrito a mano — `href="/sotaweb/proceso"`, `src="/sotaweb/images/logo.png"`, etc. Astro no lo agrega automáticamente en atributos planos de HTML dentro de `.astro` (a diferencia de cuando usás el helper `base` de Astro, que este proyecto no usa).
- Si agregás un link o una imagen nueva y se te olvida el prefijo, va a funcionar en local si por casualidad servís desde la raíz, pero **se va a romper en producción**. Revisá los archivos existentes (`Nav.astro`, `Footer.astro`) como referencia antes de escribir una ruta nueva.

## Identidad visual y estilos

Tailwind v4 vía plugin de Vite (`@tailwindcss/vite`), sin archivo `tailwind.config.js` — los tokens de tema se definen directo en CSS con `@theme` dentro de `src/styles/global.css`:

| Token | Valor | Uso |
| :--- | :--- | :--- |
| `--color-cream` / `--color-cream-light` | `#EDE8DC` / `#F5F1E8` | Fondos |
| `--color-olive` / `--color-olive-dark` | `#8A8A50` / `#6B6B3E` | Acento, links activos, bordes |
| `--color-dark` / `--color-dark-muted` | `#1C1C28` / `#3C3C4E` | Texto |
| `--font-display` | Cormorant Garamond | Títulos |
| `--font-body` | Inter | Cuerpo de texto |
| `--font-jacatra` | The Jacatra (`public/fonts/THE_JACATRA.otf`) | Etiquetas/subtítulos tipo "graffiti" |

Usá las clases de Tailwind con estos nombres (`bg-cream`, `text-olive`, `font-display`, etc.) en vez de valores hardcodeados.

**La clase `.label-jacatra`** (definida en `global.css`) es la que le da a la tipografía Jacatra su relleno oliva sólido: la fuente en sí es solo un contorno hueco, y un filtro SVG (`#jacatra-fill`, montado una sola vez en `Layout.astro`) lo rellena con `feMorphology` + `feFlood`. Si agregás texto con esa fuente en una página nueva, reusá `class="label-jacatra"` en vez de reinventar el filtro.

Tono general: comunitario, cálido, con carácter político-popular. Mobile-first, todo con utility classes de Tailwind (no hay CSS custom por componente salvo lo ya descrito).

## El simulacro

`src/pages/simulacro.astro` es una máquina de estados simple con tres pantallas (`div`s que se muestran/ocultan con la clase `hidden`):

1. **`#screen-setup`** — pantalla inicial, botón "Comenzar simulacro".
2. **`#screen-quiz`** — una pregunta a la vez: contexto compartido (si aplica), enunciado, opciones, panel de IA a la derecha, barra de progreso y timer (2 min/pregunta).
3. **Pantalla de resultados** — score total y desglose de aciertos por **competencia** (no solo el número total), para poder ver en qué está fallando cada estudiante.

Las preguntas se toman de `src/data/preguntas-ciencias.json` y se muestran en un subconjunto aleatorio por sesión, con muestreo balanceado por competencia. El resultado **no se persiste** entre sesiones todavía — vive solo en memoria durante el intento (persistir historial en `localStorage` está en el roadmap, ver `DESARROLLO.md`).

## Modelo de datos del banco de preguntas

### `src/data/competencias.json`

Define, por materia (`ciencias-naturales`, `lectura-critica`, etc.), la lista de competencias oficiales ICFES que se usan para clasificar y mostrar resultados desglosados:

```jsonc
{
  "ciencias-naturales": {
    "nombre": "Ciencias Naturales",
    "competencias": [
      { "id": "uso-comprensivo", "nombre": "...", "descripcion": "..." },
      // ...
    ]
  }
}
```

Cambiar cómo se agrupan/etiquetan las competencias de una materia es **solo editar este archivo** — no requiere tocar `simulacro.astro`. Ver `PLAN_SIMULACROS.md` §3.3 para el razonamiento detrás de la taxonomía adoptada en Ciencias Naturales (incluye una cuarta competencia, "Ciencia, Tecnología y Sociedad", tomada directamente de la fuente y no del marco oficial de 3 competencias).

### `src/data/preguntas-ciencias.json`

Array de preguntas, cada una con esta forma:

```jsonc
{
  "id": "cn-058",
  "materia": "ciencias-naturales",
  "componente": "fisica",              // fisica | biologia | quimica
  "competencia": "explicacion-de-fenomenos",  // debe existir en competencias.json
  "fuente": "cartilla-2025",
  "numero": 58,                         // número original en el PDF fuente
  "contexto": null,                     // { "texto": "...", "imagen": "..." } si la pregunta comparte contexto con otras
  "enunciado": "...",
  "opciones": ["...", "...", "...", "..."],
  "correcta": 2,                        // índice (0-based) de la opción correcta
  "explicacion": "..."
}
```

Las preguntas que originalmente traían una figura (gráfica, tabla, diagrama) y no tienen todavía una imagen curada, tienen esa figura **convertida a descripción textual** dentro del `enunciado` o del `contexto`, para que la pregunta sea autocontenida.

## Asistencia de IA (Groq)

El panel de IA en el simulacro llama directamente a la API de Groq (`https://api.groq.com/openai/v1/chat/completions`, modelo `llama-3.3-70b-versatile`) desde el navegador, sin backend intermedio. La clave se guarda en `localStorage` (`sotavento_groq_key`) cuando el usuario ingresa la suya.

> **Nota de seguridad:** el demo actual trae una clave de Groq propia hardcodeada (ofuscada en el código) como fallback para que la IA funcione sin que el usuario tenga que conseguir su propia clave. Esto es deuda técnica conocida y documentada (ver `DESARROLLO.md`, roadmap Fase 2: "sistema de traé tu propia clave Groq"). **No agregues más claves reales al código fuente** — si necesitás una clave para probar localmente, usá tu propia clave de Groq pegándola en el input de la pantalla de setup; queda en tu `localStorage`, no en el repo.

## Tareas comunes

**Agregar una página nueva**
1. Creá `src/pages/mi-pagina.astro`, importá `Layout` y envolvé el contenido en `<Layout title="..." description="...">`.
2. Si va en la navegación principal, agregá la entrada en `navLinks` en `src/components/Nav.astro` — recordá el prefijo `/sotaweb/`.

**Agregar o corregir preguntas del simulacro**
1. Editá `src/data/preguntas-ciencias.json` siguiendo el esquema de arriba. El campo `competencia` tiene que existir en `src/data/competencias.json` para esa materia.
2. Los PDFs fuente están en `Insumos/` (no versionado — ver [PLAN_SIMULACROS.md](./PLAN_SIMULACROS.md) para la metodología de extracción y curación).

**Cambiar colores, tipografías o el tono visual**
- Todo empieza en el bloque `@theme` de `src/styles/global.css`. Cambiar un token ahí se propaga a todas las clases Tailwind que lo usan.

## Convenciones

- Rutas de assets e internas siempre con el prefijo `/sotaweb/` (ver [Base path](#base-path)).
- Imágenes en `public/images/`, fuentes en `public/fonts/`.
- `Insumos/` (PDFs fuente del banco de preguntas) está en `.gitignore` — no es material para deploy, es insumo de trabajo.
- Mobile-first, utility classes de Tailwind; evitar CSS custom salvo que sea estrictamente necesario (como el filtro Jacatra).
- Español en todo el contenido y en la documentación de este repo.

## Dónde seguir leyendo

- [DESARROLLO.md](./DESARROLLO.md) — estado de cada sección del sitio y roadmap de fases futuras.
- [PLAN_SIMULACROS.md](./PLAN_SIMULACROS.md) — de dónde salen las preguntas, cómo se curan, y las decisiones sobre taxonomía de competencias.
- [Documentación oficial de Astro](https://docs.astro.build).
