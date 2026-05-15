# regalito

> Contexto del proyecto para Claude Code y cualquier colaborador. Leer antes de tocar código.

## 1. Resumen del producto

**regalito** es una web que lista locales y marcas que regalan algo gratis por tu cumpleaños en Argentina (cafés gratis, postres, descuentos, productos, etc.).

**Problema que resuelve:** la info de qué regalitos existen está dispersa en blogs viejos, threads de Twitter y posts de Instagram. No hay un solo lugar actualizado, filtrable por zona y con los requisitos claros (algunos piden cuenta en la app del local, tarjeta de fidelidad, etc.).

**Público:** personas en Argentina que quieren aprovechar promos de cumpleaños. Tono amigable, ES-AR.

**Propuesta de valor:** listado limpio, buscable, con requisitos visibles y actualizados por la comunidad.

## 2. Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, RSC) |
| Lenguaje | TypeScript (strict) |
| Estilos | Tailwind CSS v4 |
| UI components | shadcn/ui |
| Backend / DB | Supabase (Postgres + RLS) |
| Imágenes | Cloudinary (hosting + optimización con `f_auto,q_auto`) |
| Import Excel | exceljs (parseo de `.xlsx` en server actions) |
| Validación | Zod |
| Formularios | react-hook-form + zod resolver |
| Analytics | Vercel Analytics |
| Deploy | Vercel (subdominio `.vercel.app` por ahora) |
| Emails (futuro) | Resend |

## 3. Modelo de datos planeado

### Fase 1 (MVP)

**`cities`**
- `id` uuid pk
- `name` text (ej: "Buenos Aires")
- `province` text (ej: "CABA")
- `slug` text unique (ej: "buenos-aires")

**`categories`**
- `id` uuid pk
- `name` text (ej: "Cafetería")
- `slug` text unique
- `icon` text (nombre de lucide icon)

**`gifts`**
- `id` uuid pk
- `slug` text unique (ej: "starbucks-cumple")
- `name` text (título: "Bebida gratis en tu cumpleaños")
- `business_name` text (ej: "Starbucks")
- `description` text
- `requirements` text[] (lista de requisitos: "Tener cuenta en Starbucks Rewards", "DNI con fecha de nacimiento", etc.)
- `address` text (dirección o "Todas las sucursales")
- `image_url` text (nullable; URL de Cloudinary)
- `category_id` uuid fk → categories
- `source_url` text (link al post/web donde se confirma la promo)
- `status` enum: `active` | `inactive` | `draft`
- `created_at` timestamptz default now()
- `updated_at` timestamptz

**`gift_cities`** (M:N — un mismo regalito puede aplicar a varias ciudades)
- `gift_id` uuid fk → gifts on delete cascade
- `city_id` uuid fk → cities on delete restrict
- pk compuesta (`gift_id`, `city_id`)

**`submissions`**
- `id` uuid pk
- `payload` jsonb (datos del regalito propuesto, mismo shape que `gifts`)
- `submitter_email` text (opcional)
- `submitter_name` text (opcional)
- `status` enum: `pending` | `approved` | `rejected`
- `notes` text (notas del admin al revisar)
- `created_at` timestamptz default now()
- `reviewed_at` timestamptz
- `reviewer_email` text

### Fase 2 (auth pública + comunidad)

**`profiles`** ✅ aplicado
- `id` uuid pk references `auth.users(id)` on delete cascade
- `email` text not null
- `display_name` text (nullable; viene de Google `full_name`)
- `avatar_url` text (nullable; viene de Google `picture`)
- `birthday` date (nullable; habilita el recordatorio futuro)
- `created_at` / `updated_at` timestamptz
- Trigger `on_auth_user_created` crea la fila al loguearse por primera vez.
- RLS: SELECT público; UPDATE solo del dueño (`auth.uid() = id`).

- `reviews` — rating + texto, FK a `gifts` y a `profiles`
- `comments` — comentarios anidados en gifts
- `favorites` — relación M:N profiles ↔ gifts
- `reports` — reportes de "dato desactualizado", FK a `gifts`, anónimos permitidos
- Agregar a `gifts`: `verified_at` timestamptz, `verified_by` uuid → profiles

## 4. Roadmap por fases

### Fase 0 — Scaffolding ✅ (este commit)
- Repo inicializado, contexto documentado, push a GitHub.

### Fase 1 — MVP
- Setup Next.js + Tailwind + shadcn/ui.
- Setup Supabase: schema SQL, generar tipos con `supabase gen types`.
- Home (`/`) — single page: hero + listado con filtros por ciudad y categoría (server-side).
- `/regalo/[slug]` — página detalle, OG image dinámica con `next/og`.
- `/sumar` — formulario público de submission con validación Zod.
- `/admin` — login con email + contraseña (credenciales en el `.env`, cookie de sesión firmada); CRUD de gifts; carga masiva desde Excel; cola de submissions.
- Imágenes de marca en Cloudinary (file picker en el admin, optimización + cache).
- Vercel Analytics.
- Deploy en Vercel.

### Fase 2 — Comunidad
- ✅ Auth pública con Google OAuth (Supabase Auth) + tabla `profiles` + onboarding de cumpleaños.
- Favoritos.
- Reseñas (rating + comentario).
- Comentarios en gifts.
- Badge "verificado" con `verified_at` visible en cada gift.
- Botón "reportar dato desactualizado" (anónimo OK).
- Recordatorio por email cerca del cumpleaños (cron de Supabase + Resend).

### Fase 3 — Crecimiento
- Mapa con lat/lng (geocoding masivo de direcciones existentes con Nominatim/OpenStreetMap).
- Notificaciones push (web push).
- Multi-país (i18n + monedas).
- Dominio custom (ej: `regalito.com.ar`).
- OG images con avatar del local.

## 5. Convenciones de código

- **TypeScript estricto.** Nada de `any` sin comentario justificándolo.
- **Server Components por defecto.** `"use client"` solo cuando hace falta (forms, hooks de cliente).
- **Mutaciones vía Server Actions.** Nada de API routes hechas a mano salvo webhooks.
- **Validación con Zod** en el borde (forms + server actions). Tipos derivados con `z.infer`.
- **Queries a Supabase desde el server** usando el cliente server-side (publishable key, respeta RLS). El cliente service-role solo en server actions de admin.
- **RLS habilitado** en todas las tablas. Service role solo en server actions sensibles.
- **Slugs estables.** Generar al crear, nunca regenerar al editar el nombre.
- **Naming:** archivos `kebab-case`, componentes `PascalCase`, funciones `camelCase`.
- **No comentarios obvios.** Sí comentarios cuando hay un *por qué* no evidente.
- **SOLID, POO, Clean Code y escalabilidad** son criterios permanentes — ver sección 11.
- **Antes de tocar código de un dominio, leer la skill correspondiente** de `.agents/skills/` — ver sección 11.

## 6. Branding y diseño

- **Idioma:** español rioplatense (vos, "regalito", "sumá el tuyo").
- **Paleta:** base neutra (white/zinc) + acento cálido. Sugerencia inicial:
  - Primary: rosa-naranja (`#FF6B6B` → `#FF8E53` gradient para CTAs)
  - Background: `#FFF8F5` (off-white cálido)
  - Foreground: `#1A1A1A`
  - Muted: `zinc-500`
- **Tipografía:** Geist Sans (default Next.js) o Inter.
- **Hero:** título grande con UNA palabra del slogan en color (ej: "Cobrate un **regalito** en tu cumple").
- **Densidad:** aireada, mucho whitespace, cards con bordes suaves (`rounded-2xl`).
- **Estilo de referencia:** Linear, Vercel, Resend (clean + un toque cálido por la paleta).

## 7. Comandos (cuando exista la app Next.js)

```bash
pnpm dev          # dev server
pnpm build        # build de producción
pnpm lint         # eslint
pnpm typecheck    # tsc --noEmit
pnpm db:types     # supabase gen types typescript --project-id ... > src/lib/database.types.ts
```

## 8. Variables de entorno

Ver `.env.example` para la plantilla. Variables requeridas:

| Variable | Scope | Descripción |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public | Publishable key (RLS-protected). Supabase migró de `anon` keys a publishable keys; las legacy `anon` siguen funcionando pero usamos la nueva. |
| `SUPABASE_SERVICE_ROLE_KEY` | **server-only** | Bypass de RLS para operaciones admin |
| `ADMIN_EMAIL` | server | Email del admin para entrar a `/admin` |
| `ADMIN_PASSWORD` | server | Contraseña del admin (login email + password) |
| `ADMIN_SESSION_SECRET` | server | Secreto para firmar la cookie de sesión del admin (HMAC) |
| `CLOUDINARY_CLOUD_NAME` | server | Cloud name de Cloudinary (hosting de imágenes) |
| `CLOUDINARY_API_KEY` | server | API key de Cloudinary |
| `CLOUDINARY_API_SECRET` | **server-only** | API secret de Cloudinary |
| `RESEND_API_KEY` | server | (Opcional Fase 1) Para emails transaccionales |

**Nunca** commitear `.env` ni `.env.local`. Solo `.env.example` (sin valores reales).

## 9. Progreso y próximos pasos

**Hecho:**
- ✅ Scaffolding Next.js 16 + Tailwind v4 + shadcn/ui.
- ✅ Branding cálido aplicado (`globals.css`, paleta de sección 6).
- ✅ Schema SQL Fase 1 + RLS aplicados en Supabase + clientes y tipos generados.
- ✅ Home single-page: hero + listado con filtros + `/regalo/[slug]` con OG image.
- ✅ `/sumar` — formulario público con Zod + server action → cola de `submissions`.
- ✅ `/admin` — login email + contraseña; CRUD de gifts; carga masiva desde Excel.
- ✅ Imágenes de marca en Cloudinary (file picker + optimización).
- ✅ `/admin/submissions` — cola de moderación (aprobar con form precargado, rechazar con notas).
- ✅ Vercel Analytics integrado en el root layout.
- ✅ Deploy en Vercel (subdominio `.vercel.app`).
- ✅ Multi-ciudad por regalito (M:N `gift_cities`).
- ✅ Auth pública con Google OAuth + tabla `profiles` + página `/perfil` + banner de cumple.

**Próximo:** favoritos, reseñas, badge verificado, recordatorio por email (Fase 2 continúa).

## 10. Decisiones explícitas (para no relitigar)

- **Mapa:** NO en Fase 1. Solo `address` como texto. Geocoding masivo después.
- **Auth de usuarios públicos:** NO en Fase 1. Solo admin tiene login.
- **Submissions:** SIEMPRE pasan por cola de moderación. Nunca publicación directa.
- **Dominio custom:** Después de validar el producto. Empezar con `.vercel.app`.
- **i18n:** Solo español (AR) hasta Fase 3.

## 11. Skills y prácticas de ingeniería

### Skills (en `.agents/skills/`)

Son skills basadas en archivos (`SKILL.md` + referencias). **Regla: antes de escribir o modificar código de un dominio, leer la `SKILL.md` correspondiente y seguir su guía.** No son opcionales.

| Skill | Cuándo consultarla |
|---|---|
| `supabase` | Cualquier cosa de Supabase: schema, migraciones, RLS, Auth, Storage, Edge Functions, CLI/MCP. |
| `next-best-practices` | Patrones de Next.js: RSC, data fetching, async, bundling, metadata, route handlers. |
| `next-cache-components` | Caching y `"use cache"` / cache components. |
| `next-upgrade` | Al subir de versión de Next.js. |
| `react-best-practices` | Componentes, hooks, estado, performance de React. |
| `composition-patterns` | Composición de componentes y módulos. |
| `shadcn` | Agregar/personalizar componentes shadcn/ui, uso del CLI. |
| `tailwind-v4-shadcn` / `tailwind-css-patterns` | Estilos con Tailwind v4 y tokens de shadcn. |
| `frontend-design` | Diseño de UI: layout, jerarquía visual, calidad de la interfaz. |
| `accessibility` | Accesibilidad (WCAG): roles, foco, contraste, teclado. |
| `seo` | Metadata, structured data, sitemap, performance de búsqueda. |
| `nodejs-backend-patterns` / `nodejs-best-practices` | Lógica de servidor: server actions, servicios, acceso a datos. |
| `typescript-advanced-types` | Tipos avanzados, genéricos, inferencia. |

### Principios permanentes

- **SOLID / POO.** Responsabilidad única por módulo, componente y server action. Dependencias inyectadas (ej: pasar el cliente Supabase como argumento, no instanciarlo adentro de una función de dominio). En React se prioriza **composición sobre herencia**; POO se aplica de forma pragmática — patrón repository/service para acceso a datos cuando aporta claridad (ver `nodejs-backend-patterns`).
- **Escalabilidad.** Pensar el modelo de datos, las queries y los índices, y la estructura de carpetas previendo Fases 2-3 (ya esbozadas en secciones 3 y 4). No optimizar de más, pero no cerrarse puertas.
- **Clean Code.** Nombres expresivos, funciones chicas con un solo nivel de abstracción, cero duplicación, sin comentarios obvios (solo el *por qué* no evidente). Borrar código muerto en vez de comentarlo.
