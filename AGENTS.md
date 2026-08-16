# AGENTS.md — Player

Guía de referencia para trabajar en este repositorio. Léela antes de tocar código: resume la arquitectura, los principios de diseño y las convenciones que ya están decididas.

## 1. Qué es

Sistema de reproducción de música para un bar:

- **Clientes** añaden canciones (URL de YouTube) desde el móvil y ven la cola (sin modificarla).
- **Pantalla(s)** muestran el video en reproducción + la cola (sin interacción).
- **Panel de control** (staff) gestiona la cola: añadir, reordenar (drag & drop), eliminar, limpiar y reproducir/pausar/anterior/siguiente.

Estado actual: **multi-tenant + autenticación**. Hay venues (bares) con cola separada, sesión de staff (`admin` global / `user` de venue) y acceso de cliente mediante **QR rotatorio** con sesión de invitado efímera. Ver `PLAN.md` para el diseño completo.

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

| Paquete     | Tecnología                                                                                                                         |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `api`       | NestJS 11, Prisma 7 (`prisma-client` + `adapter-pg`), Zod 4, SSE, Swagger (`/api`)                                                 |
| `web`       | React Router 8 (SSR), Vite 8, Tailwind CSS 4, **shadcn/ui (Base UI)**, **TanStack Query**, `lucide-react`, `@dnd-kit/react`, Zod 4 |
| `contracts` | Zod 4 + TypeScript, compilado con `tsup` a doble formato (CJS + ESM)                                                               |

## 4. Comandos (desde la raíz)

```bash
docker compose up -d          # levantar Postgres
npm run dev:api               # API en :3000 (watch)
npm run dev:web               # Web en dev (Vite)
npm run dev:contracts         # recompila contracts en watch
npm run build                 # build de contracts + api + web
npm run typecheck             # contracts + typecheck web + build api
npm run seed                  # crea el admin inicial (idempotente)
```

- La API requiere `DATABASE_URL` (ver `apps/api/.env`) y `YOUTUBE_KEY` (API key de YouTube Data v3).
- El admin inicial ya **no** se crea automáticamente al arrancar: se crea con `npm run seed` (lee `ADMIN_NAME`/`ADMIN_EMAIL`/`ADMIN_PASSWORD` y es idempotente). Reemplazó al antiguo `BootstrapService`.
- El cliente Prisma está **gitignoreado** (`apps/api/src/prisma/generated/`). Tras clonar o tocar `schema.prisma`: `npx prisma generate` (dentro de `apps/api`). Migraciones: `npx prisma migrate deploy` / `migrate dev`.

## 5. Contratos (`packages/contracts`)

Única fuente de verdad de los tipos/schemas de la API. Todo lo que cruza HTTP/SSE está definido aquí con Zod:

- `media-item.schema.ts` → `MediaItemDto` (id, videoId, title, channelTitle, thumbnailUrl, **duration en segundos (number)**, embeddable) + `mediaListSchema`.
- `queue-item.schema.ts` → `QueueItemDto` (id, position, status, media) y `QueueDto` (array).
- `player-command.schema.ts` → `PlayerCommandDto` `{ action: "play" | "pause" | "stop", videoId: string | null }`.
- `realtime-event.schema.ts` → unión discriminada por `type`: `queue.updated` | `player.command`.
- `api-error.schema.ts` → shape de error `{ statusCode, message, errors? }`.
- `append-to-queue.schema.ts`, `move-queue.schema.ts`, `youtube-url.schema.ts`, `youtube-id.schema.ts` → inputs.
- `playlist.schema.ts` → `PlaylistDto` (id, playlistId, title, thumbnailUrl, `itemCount`) y `PlaylistDetailDto` (añade `items: MediaItemDto[]`).
- `playlist-url.schema.ts` → `playlistUrlSchema` (extrae el `list` param de la URL → brand `PlaylistId`).
- `register-playlist.schema.ts` → `registerPlaylistSchema` `{ url }` → `{ playlistId }` (mismo patrón que `append-to-queue`).

**Regla:** cualquier cambio en la forma de una respuesta o evento se hace aquí y luego se propaga. El front valida las respuestas en runtime con estos schemas.

### Nota de build (importante)

`contracts` compila a **doble formato** (CJS + ESM) con `tsup` porque Nest es CJS (`require`) y Vite/SSR inlinea los paquetes enlazados como ESM. No lo cambies a un solo formato sin revisar ambos consumidores. Config: `packages/contracts/tsup.config.ts` + `tsconfig.json` (usa `ignoreDeprecations: "6.0"` por TypeScript 6).

## 6. Backend (`apps/api`)

### Modelo de datos (Prisma)

- `MediaItem`: metadata de un video de YouTube (videoId único en la práctica; título, canal, thumbnail, duración ISO en la columna, embeddable).
- `QueueItem`: `position` (float, reorden fraccionario), `status` (enum `QueueStatus`: `queued | playing | paused`), `mediaId`.
- `Playlist`: playlist de backup registrada (`playlistId` único = id de YouTube, `title`, `thumbnailUrl`).
- `PlaylistItem`: join `playlist ↔ media` con `position` (orden en la playlist). `@@unique([playlistId, mediaId])` → deduplica canciones repetidas.
- **Cursor de reproducción** = el único `QueueItem` con `status` `playing` (o `paused`). No existe `ended`: al terminar una canción vuelve a `queued` y queda en la cola.

### Endpoints

| Método | Ruta | Acceso | Descripción |
| ------ | ---- | ------ | ----------- |
| POST | `/auth/login` | público | `{ email, password }` → sesión de staff |
| POST | `/auth/logout` | sesión | cierra la sesión |
| GET | `/auth/me` | sesión | `UserDto` actual |
| GET | `/venues` | admin | lista venues |
| POST | `/venues` | admin | crea venue `{ name, slug? }` (slug auto desde nombre) |
| PATCH | `/venues/:id` | admin | actualiza venue `{ name, slug? }` |
| DELETE | `/venues/:id` | admin | elimina venue |
| GET | `/users` | admin | lista usuarios |
| POST | `/users` | admin | crea usuario `{ name, email, password, role, venueIds }` |
| PATCH | `/users/:id` | admin | actualiza usuario `{ name, email, password?, role, venueIds }` |
| DELETE | `/users/:id` | admin | elimina usuario |
| POST | `/join/:token` | público | valida invite → sesión de invitado (cookie) |
| GET | `/venues/:slug/invite` | staff/admin | invite/QR actual (rota cada ~1 min) |
| POST | `/venues/:slug/invite/rotate` | staff/admin | fuerza rotación del QR |
| GET | `/venues/:slug/queue` | invitado/staff | cola ordenada por `position` |
| POST | `/venues/:slug/queue/append` | staff/admin | `{ url }` → añade al final |
| POST | `/venues/:slug/queue/append/video/:videoId` | staff/admin | añade por `videoId` |
| POST | `/venues/:slug/queue/item/:id/move` | staff/admin | `{ siblingId, placement }` reordena |
| DELETE | `/venues/:slug/queue/item/:id` | staff/admin | elimina item |
| DELETE | `/venues/:slug/queue/clear` | staff/admin | vacía cola |
| POST | `/venues/:slug/queue/push` | staff/admin | fuerza `queue.updated` |
| GET | `/venues/:slug/media?q=` | staff/admin | busca media registrada |
| GET | `/venues/:slug/playlist` | staff/admin | lista playlists |
| POST | `/venues/:slug/playlist` | staff/admin | registra/refresca playlist |
| GET | `/venues/:slug/playlist/:id` | staff/admin | detalle playlist |
| DELETE | `/venues/:slug/playlist/:id` | staff/admin | elimina playlist |
| GET | `/venues/:slug/requests` | invitado/staff | solicitudes pendientes |
| POST | `/venues/:slug/requests` | invitado | `{ url, requestedBy? }` |
| POST | `/venues/:slug/requests/:id/approve` | staff/admin | aprueba y encola |
| POST | `/venues/:slug/requests/:id/reject` | staff/admin | rechaza |
| POST | `/venues/:slug/player/*` | staff/admin | play/pause/next/previous/ended/error/item/:id/play |
| GET | `/events/:slug` | público | SSE (realtime por venue) |
| GET | `/api` | público | Swagger UI |

### Autenticación y multi-tenant

- **Roles**: `admin` (global) gestiona venues/usuarios y opera cualquier venue; `user` pertenece a una o varias venues (relación muchos-a-muchos `User.venues`).
- **Sesión**: `express-session` con store propio respaldado en la tabla `Session` de Prisma. Cookie HTTP-only. `SESSION_SECRET` obligatorio; `CORS_ORIGIN` (dominio fijo), `ADMIN_NAME`/`ADMIN_EMAIL`/`ADMIN_PASSWORD` (seed de admin inicial).
- **Guardas** (en `auth/guards/`): `SessionAuthGuard` (staff autenticado), `StaffGuard` (solo staff), `RolesGuard` + `@Roles('admin')`, `VenueAccessGuard` (resuelve venue por `:slug` y autoriza staff/invitado → fija `req.venueId`).
- **Acceso de invitado (QR)**: `VenueInvite` rota cada ~1 min (`INVITE_TTL_MS`). `/join/:token` crea una sesión de invitado (`guestVenueId` en la session, TTL `GUEST_SESSION_TTL_MS` = 4 h por defecto). Los endpoints de cliente requieren sesión de invitado (o staff), no son abiertos.
- Todo lo operativo está **scoped por venue**: los servicios reciben `venueId` y las queries filtran por él.

### Realtime (SSE)

`GET /events/:slug` emite por venue (el `type` es el **nombre del evento SSE**, no va dentro del `data`):

- `queue.updated` → `data` = `QueueDto` (toda la cola de la venue).
- `player.command` → `data` = `PlayerCommandDto`.
- `requests.updated` → `data` = `SongRequestListDto` (pendientes).

`EventsService` mantiene un `Map<venueId, Subject>`; cada `emit(venueId, event)` va solo a los suscriptores de esa venue.

### Flujo de reproducción (unidireccional)

```
front (botón/ended) → POST /player/* → backend actualiza status + emite player.command + queue.updated
  → pantalla recibe player.command y actúa sobre el iframe de YouTube
```

El iframe **solo** reacciona a `player.command`; nunca se reproduce fuera de un comando.

### YouTube Data API (servicio)

- `YoutubeService` usa `@nestjs/axios` y valida con Zod. Métodos: `getVideoInfo`, `getVideosInfo` (bulk, lotes de 50), `getPlaylistInfo`, `listPlaylistVideoIds` (paginando `playlistItems` con `nextPageToken`).
- **Parsing leniente**: `getVideosInfo` usa `youtubeListLenientSchema` (por ítem, con `contentDetails`/`status`/`thumbnails` opcionales) y salta solo los videos inválidos (privados/eliminados). No validar el array entero con schema estricto: un solo ítem malo descartaba el lote entero de 50.

### Playlist de backup (reproducción en cola vacía)

- `register` trae todos los `videoId` de la playlist (paginado) → `mediaService.resolveMany` en bulk → `createMany` de `PlaylistItem` (con `position`). Re-registrar reemplaza los items (idempotente por `playlistId`).
- **Deduplicación**: el `@@unique([playlistId, mediaId])` exige deduplicar por `media.id` antes de `createMany` (las playlists pueden repetir canciones).
- Cuando la cola se queda sin siguiente (o `play` con cola vacía), `PlayerService` toma un `MediaItem` random de las playlists (`PlaylistService.randomMedia()`) y lo encola + reproduce. Sin playlists → `stop` (comportamiento previo).

### Convenciones

- Validación de inputs con `ZodValidationPipe` + schemas de `@skrd/contracts`.
- Serialización de respuestas con mappers (`queue/queue.mapper.ts`): Prisma → DTO normalizado (`duration` ISO → segundos con `Temporal`).
- Errores: `HttpExceptionFilter` global devuelve siempre `{ statusCode, message, errors? }`.
- Emitir **siempre** `queue.updated` junto a `player.command` cuando cambia el estado de la cola.

## 7. Frontend (`apps/web`)

### Rutas

| Ruta            | Archivo              | Rol                                                 |
| --------------- | -------------------- | --------------------------------------------------- |
| `/` (index)     | `routes/home.tsx`    | redirect según rol (`/admin`, venue o `/select`)   |
| `/admin`        | `routes/admin.tsx`   | layout admin con submenús (`/admin/venues`, `/admin/users`) |
| `/admin/venues` | `routes/admin.venues.tsx` | gestión de venues (crear/editar/eliminar)    |
| `/admin/users`  | `routes/admin.users.tsx`  | gestión de usuarios (crear/editar/eliminar)   |
| `/select`       | `routes/select.tsx`  | elige venue (usuarios con varias venues)            |
| `/join/:token`  | `routes/join.tsx`    | valida QR → sesión de invitado → `/:slug`           |
| `/:slug`        | `routes/client.tsx`  | vista del cliente (invitado, solo lectura + añadir) |
| `/:slug/control`| `routes/control.tsx` | panel de control (staff)                            |
| `/:slug/player` | `routes/player.tsx`  | pantalla (video + cola + QR, staff)                 |

### Componentes

- `YoutubePlayer.tsx`: iframe de YouTube; se maneja por `ref` (play/pause/stop); emite `onEnded` cuando el video termina (`YT.PlayerState.ENDED`).
- `Queue.tsx`: cola de solo lectura (cliente).
- `PlayerQueue.tsx`: cola de la pantalla (más grande, resalta actual con borde izquierdo + fondo, auto-scroll al item actual).
- `QueueManager.tsx`: cola interactiva del panel (drag & drop con `@dnd-kit/react`, controles de reproducción por icono, botón ▶ por fila, ✕ eliminar, limpiar, empty state y auto-scroll al item actual).
- `NowPlaying.tsx`: tarjeta "Sonando ahora".
- `AddSongForm.tsx`: formulario de añadir (URL).
- `AddPlaylist.tsx` + `PlaylistRow.tsx` + `PlaylistItems.tsx`: sección de playlists de backup (registro, expandir con `Collapsible`, búsqueda de canciones, añadir a cola, menú de acciones por playlist).
- `MediaLibrary.tsx`: búsqueda de media registrada (biblioteca) con añadir a cola.
- `VenueFormDialog.tsx` + `UserFormDialog.tsx`: diálogos de crear/editar venue y usuario (mismo componente para ambos modos, controlado por `onClose` y montado condicionalmente desde las rutas de admin).

### Data fetching (TanStack Query)

- Todas las llamadas a API pasan por hooks de TanStack Query (caché + mutaciones). Los métodos crudos viven en `api/*.ts` (`http.ts`, `queue.ts`, `player.ts`, `media.ts`, `playlist.ts`).
- `hooks/useQueue.ts`: `useQueue()` (query `["queue"]`, `staleTime: Infinity`) + mutaciones (`useAppendToQueue`, `useAppendVideoToQueue`, `useMoveQueueItem`, `useRemoveQueueItem`, `useClearQueue`). La cola **no se refetchea**: se actualiza por SSE.
- `hooks/usePlayer.ts`: `usePlayerActions()` (mutaciones play/pause/next/previous/ended/playItem).
- `hooks/useMedia.ts`: `useMediaSearch(q)` (clave `["media","search",q]`, `enabled`, `placeholderData: keepPreviousData`).
- `hooks/usePlaylists.ts`: `usePlaylists()`, `usePlaylist(id)`, `useRegisterPlaylist()`, `useRemovePlaylist()` (invalidan `["playlists"]`).

### Cliente HTTP / SSE

- `api/http.ts`: `request<T>(path, schema, init)` → fetch, lanza `ApiError` en no-2xx, valida con el schema de Zod. **Tolera respuestas vacías** (los `@Post` de Nest devuelven 201 con body vacío).
- `context/RealtimeProvider.tsx`: un solo `EventSource` a `/events`, transporte puro pub/sub. **Ojo**: el `type` del evento está en `message.type` (nombre del evento), no en el body; hay que parsear `{ type: message.type, data: JSON.parse(message.data) }` con `realtimeEventSchema`. Distribuye cada evento a todos los suscriptores (un `Set` de handlers en un `ref`, sin estado por evento) y además se suscribe a sí mismo para hacer `queryClient.setQueryData` en `queue.updated`/`requests.updated`. **Reconexión**: en `onerror` cierra el `EventSource` y reconecta con backoff exponencial (1s → 30s tope, reset en `onopen`).
- `context/RealtimeContext.tsx`: expone `{ subscribe, isConnected, error }` vía `useRealtime()`; `subscribe(handler)` devuelve una función de unsubscribe.
- `context/useRealtimeEvent.ts`: hook `useRealtimeEvent(type, handler)` que se suscribe a un tipo de evento concreto (tipado por `type`) y usa un ref para mantener el `handler` al día sin re-suscribirse. Lo usa la pantalla para reaccionar a `player.command`. **No** modelar eventos como "último evento" en un estado: se pierden cuando llegan varios tipos seguidos (bug previo con `next`/`previous`).

### Sistema de diseño (UI)

**shadcn/ui** (Base UI, estilo `base-luma`), instalado con `npx shadcn add <component>` (desde `apps/web`). Personalización fina pendiente. Hay una skill de shadcn en `apps/web/.agents/skills/shadcn/` (reglas de styling/forms/composition/icons) para consultar al tocar UI.

- Componentes en `components/ui/*`: `button`, `input`, `card`, `badge`, `separator`, `spinner`, `collapsible`, `tooltip`, `scroll-area` (sin usar), `dropdown-menu`, `empty`, `skeleton`, `toast`.
- Config en `apps/web/components.json` (alias `~/components/ui`, base `base`, iconLibrary `lucide`).
- Tokens semánticos de shadcn en `app.css`: `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, `bg-muted`, `text-destructive`, `bg-card`, … **No** usar colores hardcodeados (los tokens custom previos `--surface/--ink/--line/--accent` quedaron obsoletos).
- `--radius: 0` se mantiene (esquinas cuadradas). `Card` trae `shadow-md`/`ring-foreground/5` por defecto.
- `.theme-dark` (solo `/player`) sobreescribe los tokens de shadcn: fondo negro + `--primary #f59e0b` (ámbar); el video es el protagonista.
- Iconos de **lucide-react**. Dentro de `Button` usar `data-icon="inline-start"`/`inline-end` sin clases de tamaño.
- Convenciones shadcn: `cn()` para clases condicionales, `gap-*` (no `space-*`), `size-*` para dimensiones iguales, `truncate`, y componentes `Empty`/`Skeleton`/`Badge`/`Tooltip`/`toast`/`DropdownMenu` en vez de markup custom.

## 8. Gotchas / decisiones registradas

- **SSE**: el `type` viaja como nombre del evento (`event: queue.updated`), no en `data`. (Causa de un bug previo en `RealtimeProvider`.)
- **`@dnd-kit/react`** (v0.5, un solo paquete) sustituye a `@dnd-kit/core`+`sortable`+`utilities`. `useSortable({ id, index })` devuelve `ref`, `handleRef`, `isDragging`. Reorden optimista local + persistencia vía `POST /queue/item/:id/move`.
- **TypeScript en web**: `SubmitEventHandler<HTMLFormElement>` para `onSubmit` (ni `FormEvent` ni `FormEventHandler`, ambos deprecados).
- **`duration`**: en BD se guarda ISO-8601 (string); en el DTO se normaliza a **segundos (number)** (usa `Temporal` en el mapper del backend; Node ≥ 26 lo trae global).
- **Prisma client generado** está gitignoreado → `npx prisma generate` tras clonar o migrar.
- **`_count` en Prisma 7** va **dentro de `include`** (`include: { _count: { select: { items: true } } }`), no top-level.
- **`ScrollArea` (Base UI)** no se usa: su viewport usa `size-full` y necesita altura definida; con `max-h-*` el contenido se desbordaba y solapaba lo siguiente. Usar `overflow-y-auto` + `max-h-*` nativo.
- **Sin `h-screen` fijo** en la vista de control: rompía el expand de las playlists. La página scrollea natural; la cola del panel usa `lg:sticky` + `lg:max-h-[calc(100vh-8rem)]`.
- **Expandir playlist** con `Collapsible`/`CollapsibleTrigger`/`CollapsibleContent` de shadcn (sin animación por ahora). El `Collapsible` debe envolver trigger + contenido como un único árbol.
- **Parsing de YouTube**: no validar el array entero de `videos` con schema estricto (un ítem inválido descartaba el lote). Usar parseo leniente por ítem y saltar solo los no disponibles.

## 9. Pendiente (evolución futura)

1. **Autenticación / roles**: separar "cliente" (añadir) de "panel" (control). Hoy la API no restringe nada.
2. **Tests**: `apps/api/test/app.e2e-spec.ts` está roto (espera `GET /` → "Hello World!"); no hay tests de servicios.
3. Nombres del bar / branding configurables en la vista de cliente.

## 10. Cómo hacer cambios (resumen del flujo que seguimos)

1. Si cambia la forma de datos de la API → actualizar `packages/contracts` y reconstruir (`npm run build -w @skrd/contracts`).
2. Backend: endpoint/service → validar con Zod → mapear a DTO → emitir eventos SSE pertinentes.
3. Frontend: método en `api/*.ts` (con schema de validación) → hook de TanStack Query en `hooks/*` → consumir en el componente/route → componentes shadcn + tokens semánticos.
4. Verificar: `npm run typecheck` (raíz). No hay suite de tests fiable todavía.
