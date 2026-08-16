# AGENTS.md — Player

Guía de referencia para trabajar en este repositorio. Léela antes de tocar código: resume la arquitectura, los principios de diseño y las convenciones que ya están decididas.

## 1. Qué es

Sistema de reproducción de música para un bar:

- **Clientes** añaden canciones (URL de YouTube) desde el móvil y ven la cola (sin modificarla).
- **Pantalla(s)** muestran el video en reproducción + la cola (sin interacción).
- **Panel de control** (staff) gestiona la cola: añadir, reordenar (drag & drop), eliminar, limpiar y reproducir/pausar/anterior/siguiente.

Estado actual: **MVP**. No hay autenticación ni separación de permisos a nivel de API (la vista de cliente solo oculta controles por UI).

## 2. Estructura (monorepo npm workspaces)

```
player/
  apps/
    api/          # NestJS + Prisma + PostgreSQL (backend)
    web/          # React Router 8 + Vite + Tailwind 4 (frontend)
  packages/
    contracts/    # Schemas Zod + tipos compartidos (fuente de verdad de la API)
  compose.yml      # Solo la base de datos (Postgres 18)
  videos.md        # URLs sueltas de prueba (no está cableado a nada)
```

- Workspaces: `apps/*`, `packages/*`.
- `packages/contracts` se consume en `api` y `web` como `@skrd/contracts`.

## 3. Stack

| Paquete     | Tecnología                                                                            |
| ----------- | ------------------------------------------------------------------------------------- |
| `api`       | NestJS 11, Prisma 7 (`prisma-client` + `adapter-pg`), Zod 4, SSE, Swagger (`/api`)    |
| `web`       | React Router 8 (SSR), Vite 8, Tailwind CSS 4, `lucide-react`, `@dnd-kit/react`, Zod 4 |
| `contracts` | Zod 4 + TypeScript, compilado con `tsup` a doble formato (CJS + ESM)                  |

## 4. Comandos (desde la raíz)

```bash
docker compose up -d          # levantar Postgres
npm run dev:api               # API en :3000 (watch)
npm run dev:web               # Web en dev (Vite)
npm run dev:contracts         # recompila contracts en watch
npm run build                 # build de contracts + api + web
npm run typecheck             # contracts + typecheck web + build api
```

- La API requiere `DATABASE_URL` (ver `apps/api/.env`) y `YOUTUBE_KEY` (API key de YouTube Data v3).
- El cliente Prisma está **gitignoreado** (`apps/api/src/prisma/generated/`). Tras clonar o tocar `schema.prisma`: `npx prisma generate` (dentro de `apps/api`). Migraciones: `npx prisma migrate deploy` / `migrate dev`.

## 5. Contratos (`packages/contracts`)

Única fuente de verdad de los tipos/schemas de la API. Todo lo que cruza HTTP/SSE está definido aquí con Zod:

- `media-item.schema.ts` → `MediaItemDto` (id, videoId, title, channelTitle, thumbnailUrl, **duration en segundos (number)**, embeddable).
- `queue-item.schema.ts` → `QueueItemDto` (id, position, status, media) y `QueueDto` (array).
- `player-command.schema.ts` → `PlayerCommandDto` `{ action: "play" | "pause" | "stop", videoId: string | null }`.
- `realtime-event.schema.ts` → unión discriminada por `type`: `queue.updated` | `player.command`.
- `api-error.schema.ts` → shape de error `{ statusCode, message, errors? }`.
- `append-to-queue.schema.ts`, `move-queue.schema.ts`, `youtube-url.schema.ts`, `youtube-id.schema.ts` → inputs.

**Regla:** cualquier cambio en la forma de una respuesta o evento se hace aquí y luego se propaga. El front valida las respuestas en runtime con estos schemas.

### Nota de build (importante)
`contracts` compila a **doble formato** (CJS + ESM) con `tsup` porque Nest es CJS (`require`) y Vite/SSR inlinea los paquetes enlazados como ESM. No lo cambies a un solo formato sin revisar ambos consumidores. Config: `packages/contracts/tsup.config.ts` + `tsconfig.json` (usa `ignoreDeprecations: "6.0"` por TypeScript 6).

## 6. Backend (`apps/api`)

### Modelo de datos (Prisma)
- `MediaItem`: metadata de un video de YouTube (videoId único en la práctica; título, canal, thumbnail, duración ISO en la columna, embeddable).
- `QueueItem`: `position` (float, reorden fraccionario), `status` (enum `QueueStatus`: `queued | playing | paused`), `mediaId`.
- **Cursor de reproducción** = el único `QueueItem` con `status` `playing` (o `paused`). No existe `ended`: al terminar una canción vuelve a `queued` y queda en la cola.

### Endpoints
| Método | Ruta                    | Descripción                                            |
| ------ | ----------------------- | ------------------------------------------------------ |
| GET    | `/queue`                | cola actual ordenada por `position`                    |
| POST   | `/queue/append`         | `{ url }` → resuelve y añade al final                  |
| POST   | `/queue/item/:id/move`  | `{ siblingId, placement: "before"\|"after" }` reordena |
| DELETE | `/queue/item/:id`       | elimina un item                                        |
| DELETE | `/queue/clear`          | vacía la cola                                          |
| POST   | `/queue/push`           | fuerza `queue.updated` (broadcast manual)              |
| POST   | `/player/play`          | reproduce/resume (idempotente)                         |
| POST   | `/player/pause`         | pausa                                                  |
| POST   | `/player/next`          | siguiente                                              |
| POST   | `/player/previous`      | anterior                                               |
| POST   | `/player/item/:id/play` | reproduce un item concreto (selección en el panel)     |
| POST   | `/player/events/ended`  | el front avisa que una canción terminó                 |
| GET    | `/events`               | SSE (realtime)                                         |
| GET    | `/api`                  | Swagger UI                                             |

### Realtime (SSE)
`GET /events` emite dos tipos de evento (el `type` es el **nombre del evento SSE**, no va dentro del `data`):
- `queue.updated` → `data` = `QueueDto` (toda la cola).
- `player.command` → `data` = `PlayerCommandDto`.

### Flujo de reproducción (unidireccional)
```
front (botón/ended) → POST /player/* → backend actualiza status + emite player.command + queue.updated
  → pantalla recibe player.command y actúa sobre el iframe de YouTube
```
El iframe **solo** reacciona a `player.command`; nunca se reproduce fuera de un comando.

### Convenciones
- Validación de inputs con `ZodValidationPipe` + schemas de `@skrd/contracts`.
- Serialización de respuestas con mappers (`queue/queue.mapper.ts`): Prisma → DTO normalizado (`duration` ISO → segundos con `Temporal`).
- Errores: `HttpExceptionFilter` global devuelve siempre `{ statusCode, message, errors? }`.
- Emitir **siempre** `queue.updated` junto a `player.command` cuando cambia el estado de la cola.

## 7. Frontend (`apps/web`)

### Rutas
| Ruta        | Archivo              | Rol                                                 |
| ----------- | -------------------- | --------------------------------------------------- |
| `/` (index) | `routes/client.tsx`  | vista del cliente (añadir + ver cola, solo lectura) |
| `/control`  | `routes/control.tsx` | panel de control (staff)                            |
| `/player`   | `routes/player.tsx`  | pantalla (video + cola, sin interacción)            |

### Componentes
- `YoutubePlayer.tsx`: iframe de YouTube; se maneja por `ref` (play/pause/stop); emite `onEnded` cuando el video termina (`YT.PlayerState.ENDED`).
- `Queue.tsx`: cola de solo lectura (cliente).
- `PlayerQueue.tsx`: cola de la pantalla (más grande, resalta actual con borde izquierdo + fondo, auto-scroll al item actual).
- `QueueManager.tsx`: cola interactiva del panel (drag & drop con `@dnd-kit/react`, botón ▶ por fila, ✕ eliminar, limpiar).
- `NowPlaying.tsx`: tarjeta "Sonando ahora".
- `AddSongForm.tsx`: formulario de añadir (URL).
- `hooks/useQueue.ts`: estado compartido de la cola (fetch inicial + reacción a `queue.updated`).

### Cliente HTTP / SSE
- `api/http.ts`: `request<T>(path, schema, init)` → fetch, lanza `ApiError` en no-2xx, valida con el schema de Zod. **Tolera respuestas vacías** (los `@Post` de Nest devuelven 201 con body vacío).
- `api/queue.ts`, `api/player.ts`: métodos tipados.
- `context/RealtimeProvider.tsx`: un solo `EventSource` a `/events`. **Ojo**: el `type` del evento está en `message.type` (nombre del evento), no en el body; hay que parsear `{ type: message.type, data: JSON.parse(message.data) }` con `realtimeEventSchema`.

### Sistema de diseño (UI)
Estilo **brutalista** moderado, decidido para no verse genérico:

- **Sin** `border-radius`, **sin** `shadow`. Bordes duros de 2px (`border-2`).
- Tipografía en `uppercase` + `font-bold` para títulos y botones.
- Iconos de **lucide-react** (nada de emojis).
- Paleta definida como **tokens semánticos** en `app.css` (Tailwind v4 `@theme inline` + variables CSS):
  - Tema claro cálido (por defecto): `--surface #faf7f2`, `--surface-card #ffffff`, `--ink #292524`, `--ink-muted #78716c`, `--accent #d97706` (ámbar), `--line #e7e5e4`.
  - `.theme-dark` (solo `/player`): negro puro con ámbar `#f59e0b`; el video es el protagonista.
- Usa las utilities semánticas (`bg-surface`, `text-ink`, `bg-accent`, `divide-line`, …), **no** colores hardcodeados, para que los componentes compartidos se adapten por contexto (`.theme-dark`).
- Tailwind v4 pone `cursor: default` en botones → añadir `cursor-pointer` explícito.

## 8. Gotchas / decisiones registradas

- **SSE**: el `type` viaja como nombre del evento (`event: queue.updated`), no en `data`. (Causa de un bug previo en `RealtimeProvider`.)
- **`@dnd-kit/react`** (v0.5, un solo paquete) sustituye a `@dnd-kit/core`+`sortable`+`utilities`. `useSortable({ id, index })` devuelve `ref`, `handleRef`, `isDragging`. Reorden optimista local + persistencia vía `POST /queue/item/:id/move`.
- **TypeScript en web**: `SubmitEventHandler<HTMLFormElement>` para `onSubmit` (ni `FormEvent` ni `FormEventHandler`, ambos deprecados).
- **`duration`**: en BD se guarda ISO-8601 (string); en el DTO se normaliza a **segundos (number)** (usa `Temporal` en el mapper del backend; Node ≥ 26 lo trae global).
- **Prisma client generado** está gitignoreado → `npx prisma generate` tras clonar o migrar.

## 9. Pendiente (evolución futura)

1. **Autenticación / roles**: separar "cliente" (añadir) de "panel" (control). Hoy la API no restringe nada.
2. **Tests**: `apps/api/test/app.e2e-spec.ts` está roto (espera `GET /` → "Hello World!"); no hay tests de servicios.
5. Nombres del bar / branding configurables en la vista de cliente.

## 10. Cómo hacer cambios (resumen del flujo que seguimos)

1. Si cambia la forma de datos de la API → actualizar `packages/contracts` y reconstruir (`npm run build -w @skrd/contracts`).
2. Backend: endpoint/service → validar con Zod → mapear a DTO → emitir eventos SSE pertinentes.
3. Frontend: método en `api/*.ts` (con schema de validación) → consumir en el componente/route → estilos con tokens semánticos.
4. Verificar: `npm run typecheck` (raíz). No hay suite de tests fiable todavía.
