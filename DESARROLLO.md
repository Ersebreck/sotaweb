# Ruta de desarrollo — Sitio web Pre-ICFES Sotavento

## Stack
- **Framework:** Astro (static output)
- **Estilos:** Tailwind CSS
- **Hosting:** GitHub Pages (portable a Netlify/Vercel sin cambios de código)
- **Idioma:** Español

---

## Identidad visual
- **Colores:** verde oliva/khaki, crema/blanco roto, carbón oscuro para texto
- **Tipografía:** serif display para títulos, sans-serif para cuerpo
- **Elementos gráficos:** círculos y arcos geométricos como decoración (del material original de Sotavento)
- **Tono:** comunitario, cálido, con carácter político popular

---

## Estructura del sitio

### Fase 1 — MVP (actual)
| Sección | Ruta | Descripción |
|---|---|---|
| Inicio | `/` | Hero con identidad, descripción breve, sedes |
| Quiénes somos | `/quienes-somos` | Historia (línea de tiempo 2017→hoy), marco político (educación popular, lo popular), vínculo con Aguante Popular |
| Voluntarixs | `/voluntarixs` | Qué significa ser educadore popular en Sotavento, qué se requiere, cómo sumarse (contacto) |

### Fase 2 — Próximas secciones
| Sección | Descripción |
|---|---|
| Contenidos | Materiales de clase, áreas del ICFES, recursos |
| Sedes | Info detallada Ciudad Bolívar y Bosa |
| Noticias / Actualidad | Comunicados, actividades recientes |

---

## Convenciones del proyecto
- Contenido editable en archivos `.json` o `.md` en `src/content/` (sin tocar componentes)
- Componentes reutilizables: `Nav`, `Footer`, `SectionHero`, `Timeline`, `VolunteerCard`
- Sin JavaScript del lado del cliente salvo que sea estrictamente necesario
- Mobile-first

---

## Tareas Fase 1

- [ ] Scaffolding Astro + Tailwind
- [ ] Layout base (Nav + Footer con logos)
- [ ] Página: Inicio
- [ ] Página: Quiénes somos (con línea de tiempo)
- [ ] Página: Voluntarixs
- [ ] Deploy en GitHub Pages
- [ ] Dominio personalizado (opcional)
