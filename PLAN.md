# Plan — Multi-tenant (venues) + autenticación + nombre de cliente

Documento de seguimiento para la evolución desde el MVP. Estado: **implementado** (backend + frontend; verificado con `npm run typecheck` y smoke test de la API).

## Decisiones de diseño

- **Staff**: varios usuarios con roles `admin` (global) + `user` (de una venue).
- **Pantalla `/player`**: mismo login del staff.
- **Sesión**: cookie HTTP-only (server-side con `express-session`), persistida en la tabla `Session` de Prisma.
- **Venues**: cada venue es un bar con cola separada. Direccionamiento por **slug en la ruta** (`/:slug`, `/:slug/control`, `/:slug/player`).
- **Admin global**: gestiona venues/usuarios y opera cualquier venue con un **selector**.
- **Nombre del cliente**: opcional, se guarda en la solicitud y se **propaga a la cola** al aprobar.
- **Cliente (`/:slug`)**: NO se autentica con login; accede mediante una **sesión de invitado efímera** obtenida al escanear un **QR rotatorio** (ver sección "Acceso de invitado"). El QR rota automáticamente cada **1 minuto** y otorga una sesión de invitado de **4 horas**.
- **CORS**: dominio fijo configurado por variable de entorno (`CORS_ORIGIN`).
- **Errores de reproducción**: se mueven de `MediaItem` (global) a una tabla **por venue** (`VenueMediaError`).

---

## Acceso de invitado (QR rotatorio)

Objetivo: evitar abuso de usuarios públicos. El QR del bar es temporal y las sesiones de cliente son efímeras, de modo que un QR filtrado deja de ser útil al poco tiempo.

Flujo previsto:

1. El **QR rota automáticamente cada 1 minuto** y se muestra en la **pantalla del player** (`/:slug/player`), que es lo que los clientes ven mayoritariamente.
2. El QR codifica un enlace `/join/:token`.
3. El cliente escanea → el backend valida el token (no caducado, pertenece a la venue) → crea una **sesión de invitado** (cookie HTTP-only, TTL de **4 horas**, no rolling) → redirige a `/:slug`.
4. El cliente usa la vista con su sesión de invitado (ver cola, solicitar, SSE) mientras esté viva.
5. Al expirar la sesión de invitado, debe volver a escanear.

Controles anti-abuso:

- **Invite** (QR) con TTL de **1 minuto** y rotación automática: si el token se comparte, deja de ser válido al minuto; el que ya escaneó queda "dentro" con su sesión de 4 horas.
- **Sesión de invitado** con TTL de **4 horas** (no rolling).
- (Opcional) rate-limiting de solicitudes por sesión de invitado.
- (Opcional) máximo de sesiones de invitado activas por venue.

### Modelos adicionales

```prisma
model VenueInvite {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  venueId   String   @db.Uuid
  token     String   @unique
  createdAt DateTime @default(now())
  expiresAt DateTime
  venue     Venue    @relation(...)
}
```

La sesión de invitado reutiliza la tabla `Session` (ver abajo): los datos de sesión guardan `{ kind: 'guest', venueId }`; el TTL se fija al crear la sesión.

---

## Decisiones cerradas

1. **TTLs**: QR/invite = **1 minuto** (rotación automática); sesión de invitado = **4 horas**. Ambos configurables por env (`INVITE_TTL`, `GUEST_SESSION_TTL`).
2. **Efecto de rotar el QR**: la rotación solo invalida el token (nuevos escaneos); las sesiones de invitado existentes viven hasta su expiración natural de 4 h.
3. **Rotación**: automática (cada 1 min). El panel refresca el QR a ese ritmo; opcional un botón "rotar ahora".
4. **`MediaItem.playbackErrorCode` global**: se mueve a `VenueMediaError` (por venue).

## Decisiones abiertas (menores, no bloquean el arranque)

- **Rate limiting**: ¿lo incluimos ya o lo dejamos para una iteración posterior?
- Cómo refresca la pantalla del player el QR actual (polling cada ~30-60 s vs evento SSE `invite.updated`).

---

## Fases

### Fase 1 — Autenticación + sesión persistente

- [ ] Migración Prisma: `User`, `Session`, `Venue`, `VenueMediaError`, `VenueInvite`, `UserRole`.
- [ ] Módulo `auth/`: `AuthService`, `AuthController` (`/auth/login`, `/auth/logout`, `/auth/me`).
- [ ] Store de sesión custom en Prisma (`session.store.ts`).
- [ ] Guards: `SessionAuthGuard`, `RolesGuard` (+ `@Roles`), `VenueGuard` (staff), `GuestGuard` (invitado).
- [ ] `main.ts`: `express-session` + CORS con credenciales + `SESSION_SECRET`.
- [ ] Seed de admin global desde env (`ADMIN_USERNAME`/`ADMIN_PASSWORD`).
- [ ] Contratos: `user.schema.ts`, `login.schema.ts`, `create-user.schema.ts`, `create-venue.schema.ts`, `venue.schema.ts`.
- [ ] Dependencias: `express-session`, `bcrypt`, `@types/express-session`, `@types/bcrypt`.

### Fase 2 — Venues + scoping

- [ ] Modelos: `Venue`, `User.venueId`, `QueueItem.venueId`, `SongRequest.venueId`, `Playlist.venueId`.
- [ ] Módulo venues + usuarios (admin): `GET/POST/DELETE /venues`, `GET/POST/DELETE /users`.
- [ ] Realtime per-venue: `EventsService` → `Map<venueId, Subject>`; `GET /events/:slug`.
- [ ] Namespace de rutas operativas bajo `/venues/:slug/...`.
- [ ] Scoping de servicios (`QueueService`, `PlayerService`, `RequestsService`, `PlaylistService`, `MediaService`) por `venueId`.
- [ ] Todos los `emit(...)` pasan `venueId`.
- [ ] Playback errors por venue: `notBlockedMediaFilter(venueId)`, `PlayerService.error(code)` → `VenueMediaError`.

### Fase 3 — Acceso de invitado (QR)

- [ ] Modelo `VenueInvite` + endpoints: `GET /venues/:slug/invite` (QR actual, rota automáticamente si pasó >1 min), `POST /venues/:slug/invite/rotate` (rotar ahora, opcional).
- [ ] `GET /join/:token` → valida token, crea sesión de invitado, redirige a `/:slug`.
- [ ] `GuestGuard` para los endpoints de cliente (cola, solicitudes, SSE).
- [ ] TTLs configurables por env (`INVITE_TTL`, `GUEST_SESSION_TTL`).
- [ ] (Opcional) rate limiting / límite de sesiones activas.

### Fase 4 — Nombre opcional del cliente

- [ ] `SongRequest.requestedBy` + `QueueItem.requestedBy` (nullable).
- [ ] Contratos: `create-song-request.schema.ts`, `song-request.schema.ts`, `queue-item.schema.ts`, `media-item.schema.ts` (quitar `playbackErrorCode`).
- [ ] `RequestsService.create` guarda `requestedBy`; `approve` → `appendMedia(mediaId, requestedBy)`.
- [ ] `QueueService.enqueue(mediaId, requestedBy?)`.

### Fase 5 — Frontend

- [ ] Rutas: `/login`, `/admin`, `/join/:token`, `/:venueSlug`, `/:venueSlug/control`, `/:venueSlug/player`.
- [ ] Auth client: `api/auth.ts`, `hooks/useAuth.ts`, `http.ts` (`credentials: 'include'`), `realtime.client.ts` (`withCredentials: true` → `/events/:slug`).
- [ ] `RequireAuth` (login inline) + `LoginForm.tsx` + logout en header.
- [ ] Venue selector para admin en `/admin` (gestión de venues/usuarios).
- [ ] QR visible en la pantalla del player (`/:slug/player`) con rotación automática (refresco del invite actual).
- [ ] Cliente: si no hay sesión de invitado, mostrar "escanea el QR"; `RequestSongForm` con nombre opcional; mostrar "por X" en `Requests`, `SongRequests`, `Queue`, `QueueManager`, `PlayerQueue`.
- [ ] Todos los `api/*.ts` prefijan `/venues/${slug}`.

### Fase 6 — Config / docs / verificación

- [ ] `apps/api/.env`: `SESSION_SECRET`, `CORS_ORIGIN`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `INVITE_TTL`, `GUEST_SESSION_TTL`.
- [ ] Actualizar `AGENTS.md`.
- [ ] `npm run build -w @skrd/contracts`
- [ ] `npx prisma migrate dev` + `npx prisma generate`
- [ ] `npm run typecheck`
- [ ] Flujo manual: crear venue → crear user → login → QR → escanear → cliente → solicitar con nombre → aprobar (nombre en cola) → player recibe `player.command` scoped → expirar sesión de invitado.

---

## Modelo de datos objetivo

```prisma
enum UserRole { admin user }

model Venue {
  id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  slug         String   @unique
  name         String
  createdAt    DateTime @default(now())
  users        User[]
  queueItems   QueueItem[]
  songRequests SongRequest[]
  playlists    Playlist[]
  mediaErrors  VenueMediaError[]
  invites      VenueInvite[]
}

model User {
  id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  username     String   @unique
  passwordHash String
  role         UserRole @default(user)
  venueId      String?  @db.Uuid
  venue        Venue?   @relation(fields: [venueId], references: [id])
  createdAt    DateTime @default(now())
}

model Session {
  sid       String   @id
  userId    String?
  venueId   String?
  data      Json
  expiresAt DateTime
}

model VenueInvite {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  venueId   String   @db.Uuid
  token     String   @unique
  createdAt DateTime @default(now())
  expiresAt DateTime
  venue     Venue    @relation(...)
}

model VenueMediaError {
  id        String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  venueId   String    @db.Uuid
  mediaId   String    @db.Uuid
  errorCode Int
  venue     Venue     @relation(...)
  media     MediaItem @relation(...)
  @@unique([venueId, mediaId])
}
```

Cambios en modelos existentes:

- `QueueItem` + `venueId`, + `requestedBy String?`.
- `SongRequest` + `venueId`, + `requestedBy String?`.
- `Playlist` + `venueId` (+ `@@unique([venueId, playlistId])`).
- `MediaItem`: quitar `playbackErrorCode`; añadir relación `venueMediaErrors`.

---

## Superficie de API objetivo

### Auth

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/auth/login` | público |
| POST | `/auth/logout` | sesión |
| GET | `/auth/me` | sesión |

### Acceso de invitado (QR)

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/join/:token` | público (crea sesión de invitado) |
| GET | `/venues/:slug/invite` | staff/admin |
| POST | `/venues/:slug/invite/rotate` | staff/admin |

### Admin global

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/venues` | admin |
| POST | `/venues` | admin |
| DELETE | `/venues/:id` | admin |
| GET | `/users` | admin |
| POST | `/users` | admin |
| DELETE | `/users/:id` | admin |

### Operativo (bajo `/venues/:slug`)

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/venues/:slug/queue` | invitado / staff |
| POST | `/venues/:slug/queue/append` | staff/admin |
| POST | `/venues/:slug/queue/append/video/:videoId` | staff/admin |
| POST | `/venues/:slug/queue/item/:id/move` | staff/admin |
| DELETE | `/venues/:slug/queue/item/:id` | staff/admin |
| DELETE | `/venues/:slug/queue/clear` | staff/admin |
| POST | `/venues/:slug/queue/push` | staff/admin |
| GET | `/venues/:slug/media?q=` | staff/admin |
| GET | `/venues/:slug/playlist` | staff/admin |
| POST | `/venues/:slug/playlist` | staff/admin |
| GET | `/venues/:slug/playlist/:id` | staff/admin |
| DELETE | `/venues/:slug/playlist/:id` | staff/admin |
| GET | `/venues/:slug/requests` | invitado / staff |
| POST | `/venues/:slug/requests` | invitado |
| POST | `/venues/:slug/requests/:id/approve` | staff/admin |
| POST | `/venues/:slug/requests/:id/reject` | staff/admin |
| POST | `/venues/:slug/player/*` | staff/admin |
| GET | `/events/:slug` (SSE) | invitado / staff |

---

## Notas / riesgos

- Refactor amplio: toca todos los servicios y el SSE (ahora per-venue).
- Confirmar que el front no usa `playbackErrorCode` (no aparece en ningún componente actual).
- Cookies en producción (web y API en hosts distintos): `sameSite: none; secure: true` vía HTTPS, parametrizado por `NODE_ENV`.
- `MediaItem` sigue siendo global; lo único per-venue es el error de reproducción.
- La sesión de invitado y la de staff comparten la misma tabla `Session` (diferenciadas por `kind`/`userId` en `data`), con TTLs distintos.
