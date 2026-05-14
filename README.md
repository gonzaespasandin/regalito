# regalito 🎁

Listado de regalitos gratis por tu cumpleaños en Argentina. Cafés, postres, descuentos y más — todo en un solo lugar, con los requisitos claros y verificados por la comunidad.

> 🚧 **Estado:** en construcción. Fase 0 (scaffolding) completada.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Supabase** (Postgres + Auth)
- Deploy en **Vercel**

## Correr local

```bash
# 1. Clonar el repo
git clone https://github.com/<tu-user>/regalito.git
cd regalito

# 2. Instalar dependencias (cuando exista la app Next)
pnpm install

# 3. Copiar variables de entorno
cp .env.example .env.local
# Completar los valores con tu proyecto Supabase

# 4. Levantar dev server
pnpm dev
```

## Contribuir

¿Conocés un regalito que no está en la lista? Vas a poder sumarlo desde el formulario `/sumar` (próximamente). Mientras tanto, abrí un issue.

## Roadmap

Ver [CLAUDE.md](./CLAUDE.md) para el roadmap completo, modelo de datos y convenciones.

- **Fase 1 (MVP):** Listado + filtros + submissions + dashboard admin.
- **Fase 2:** Auth pública, reseñas, comentarios, favoritos, verificación.
- **Fase 3:** Mapa, notificaciones, multi-país.

## Licencia

MIT
