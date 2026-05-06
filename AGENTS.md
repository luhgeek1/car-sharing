# AI Coding Guidelines

## Context & Documentation (Context7 MCP)

Always use Context7 MCP for library/API documentation, code generation, setup, and configuration questions without requiring the user to explicitly ask.
If the user provides an explicit Context7 library ID (for example, `/supabase/supabase`), skip library resolution and query that library directly.
If the user specifies a library version, prefer that version's documentation.
If Context7 is unavailable, state that briefly and fall back to official documentation.

---

# Project: Righteous Rides — Premium Car Sharing

Luxury / performance vehicle rental & service platform. Public marketing
surface (Home / Services / Fleet / About / Contact / Auth / Profile) plus an
admin console for managing the fleet, services, site content, and contact
leads. Aesthetic: black background, Montserrat display + Inter sans, uppercase
tracking-wide headings, grayscale-leaning hero photography. Reference design
came from `righteous-rides/` (since deleted) and was ported into Next.js.

## Repo layout

```
.
├── backend/                FastAPI app
├── frontend/               Next.js 15 App Router
├── nginx/                  Reverse proxy (port 80)
├── docker-compose.yml      backend, frontend, nginx, postgres, redis, minio, minio-init
└── AGENTS.md               you are here
```

## Stack

| Layer    | Tech                                                                    |
| -------- | ----------------------------------------------------------------------- |
| Backend  | Python 3.13 · FastAPI · SQLAlchemy 2 (async) · Alembic · Pydantic v2    |
| DB       | PostgreSQL 17                                                           |
| Cache    | Redis 8 (sessions, role cache, rate limit)                              |
| Storage  | MinIO (S3-compatible) — public + private buckets, presigned PUT uploads |
| Auth     | JWT RS256 (access + refresh), CSRF cookie for web, RBAC via roles table |
| Frontend | Next.js 15 (App Router, RSC) · React 19 · TypeScript                    |
| UI       | Tailwind v4 + tw-animate-css · shadcn-style primitives (radix-ui)       |
| Anim     | motion/react (Framer Motion v12)                                        |
| Data     | TanStack Query · axios · Zod · react-hook-form                          |
| Edge     | nginx (proxies `/api/`, `/media-public/`, `/media-private/`, `/`)       |

## Local dev

```bash
docker compose up --build -d
# http://localhost           # frontend (nginx → Next.js)
# http://localhost/api/docs  # FastAPI Swagger
# http://localhost:9001      # MinIO console (minioadmin/minioadmin)
```

Backend runs Alembic migrations on container start (`backend/entry.sh`).

### Promoting a user to admin

After registering at `/auth`:

```bash
docker compose exec -T db psql -U postgres -d templatepg -c \
  "INSERT INTO user_roles (user_id, role_id)
   SELECT u.id, r.id FROM users u, roles r
   WHERE u.email='you@example.com' AND r.slug='admin';"
```

Existing dev admin (created during testing): `admin-test-1778051306@example.com` / `Passw0rd!`.

---

## Backend

### Layered structure (FSD-ish)

```
backend/src/
├── api/v1/                       FastAPI routers
│   ├── auth/                     register · login · logout · refresh
│   ├── users/me/                 profile (get/patch) · avatar (presign/confirm/delete)
│   ├── cars/                     public list + get
│   ├── services/                 public list of marketing services
│   ├── site/                     public site content (home/about/contact copy)
│   ├── contact_requests/         create lead
│   ├── misc/languages/           shared dropdown source
│   └── admins/                   require('admin') — users / cars / stats
├── domain/                       Pydantic schemas + enums (UserModel, CarModel, …)
├── service/                      Use-case layer (UserService, CarService, …)
├── database/
│   ├── relational_db/
│   │   ├── tables/               SQLAlchemy models + per-table interface (repo)
│   │   ├── unit_of_work.py       UoW context manager (commit/rollback)
│   │   └── session.py            engine + get_uow dependency
│   └── redis/                    cache repos
├── core/
│   ├── security.py               auth_user · require(role) · JWT issue/verify
│   ├── rbac.py                   role/permission helpers
│   ├── error_handling.py         DomainError → HTTP mapper
│   └── http/cookies.py           refresh + CSRF cookie set/clear
├── migrations/                   Alembic
├── service/media/storage_service.py  MinIO/S3 client + presigned URLs
└── main.py                       FastAPI app factory + lifespan
```

### Domain models (DB)

| Table              | Notes                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------- |
| `users`            | UUID, email/password_hash, username, avatar_key, banned, **auth_version** (bumped on role/ban change to invalidate JWTs) |
| `roles`            | seeded `admin`, `member`                                                              |
| `user_roles`       | many-to-many                                                                          |
| `cars`             | UUID, name/brand/model/year, category enum, **images TEXT[]** (was image_url; first item is cover), price_per_day, highlights TEXT[], is_available |
| `services`         | marketing services rendered on /services and homepage grid                            |
| `site_content`     | key/value blob storing copy for hero, intro, why-choose, page intros, footer          |
| `contact_requests` | form leads from /contact                                                              |
| `languages`        | dropdown reference data                                                               |

**Migration chain** (`backend/src/migrations/versions/`):

```
fa110bc90883  create_users_table
6d5fe9b0b3f1  introduce_rbac
c0f7a1b21f3a  create_cars_table         (seeds 4 sample cars)
24d4c0c5f0ce  add_site_content_services_and_contact_requests
d3f1c8a9e210  cars_replace_image_url_with_images   (backfill ARRAY[image_url] → images)
```

### API surface

All under `/api/v1`.

**Auth** — `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`. Web client (`X-Client: web`) gets refresh in httpOnly cookie + CSRF cookie; mobile client gets both tokens in body.

**Current user** — `GET /users/me`, `PATCH /users/me` (username), `POST /users/me/avatar/presign`, `POST /users/me/avatar/confirm`, `DELETE /users/me/avatar`.

**Public** — `GET /cars/`, `GET /cars/{id}`, `GET /services/`, `GET /site/content`, `POST /contact_requests/`, `GET /misc/languages/`.

**Admin** (require `admin`) —
- Cars: `POST /admins/cars/upload-presign`, `POST /admins/cars/`, `PATCH /admins/cars/{id}`, `DELETE /admins/cars/{id}`
- Users: `GET /admins/users/`, `POST /admins/users/{id}/ban`, `PUT /admins/users/{id}/roles`
- Stats: `GET /admins/stats/users/summary`, `GET /admins/stats/users/graphs/registrations`

**System** — `GET /api/ping`, `GET /api/health`, `GET /api/ready` (db/redis/storage health).

### Auth & RBAC pattern

- `Depends(auth_user)` — requires valid access token, returns `User`.
- `Depends(require('admin'))` — requires the named role.
- JWT carries `sub`, `jti`, `av` (auth_version), `src`. Bumping `user.auth_version` invalidates all live tokens for that user (used when changing roles or banning).
- The `roles` field on `UserModel` is **aliased as `role_slugs`** in the wire JSON (Pydantic `alias`). Frontend `getMyProfile` normalises it back to `roles`.

### Storage (MinIO/S3)

`MediaStorageService` (`service/media/storage_service.py`) holds two clients (internal for ops, public for presign with browser-reachable host). Pattern for uploads:

1. Client requests `POST .../upload-presign` with `{filename, content_type}`.
2. Backend returns `{object_key, upload_url (presigned PUT), public_url, expires_in}`.
3. Client uploads file straight to MinIO via `PUT upload_url` (Content-Type matches).
4. Client stores `public_url` in the create/update payload.

Buckets: `media-public` (cars, avatars, anonymous-readable) and `media-private`. Created automatically by `minio-init` compose service.

Allowed image content types: `image/jpeg`, `image/png`, `image/webp`. Car image keys: `cars/{uuid}.{ext}`.

### Conventions

- **One file per route handler.** Each endpoint module exposes `router = APIRouter()` and the parent `__init__.py` glues them.
- **Service ↔ repo split.** Routers depend on a Service from `service/<domain>/`, which composes UoW + repo (`<table>Interface` class wrapping the SQLAlchemy session).
- **Errors are DomainError subclasses.** Throw a `NotFoundError`/`ConflictError`/etc. from service code; the global exception handler maps to the right HTTP status with `error_code`.
- **Migrations are hand-written**, not autogenerated. Always backfill data before dropping columns (see `d3f1c8a9e210`).

---

## Frontend

### App Router layout

```
frontend/src/
├── app/
│   ├── layout.tsx                Root: fonts (Inter + Montserrat), Providers, SiteHeader, SiteFooter
│   ├── page.tsx                  Home (client — useQuery for site content + services)
│   ├── services/page.tsx
│   ├── about/page.tsx
│   ├── contact/page.tsx          react-hook-form + zod, posts to /contact_requests
│   ├── fleet/page.tsx            grid; cards link into [id]; "N photos" badge
│   ├── fleet/[id]/page.tsx       RSC fetch + <CarGallery /> client island + lightbox
│   ├── auth/page.tsx             login / register toggle (suspense-wrapped useSearchParams)
│   ├── profile/page.tsx          /users/me view + edit username
│   └── admin/
│       ├── layout.tsx            <RequireAdmin> guard, sub-header with nav
│       ├── page.tsx              overview / shortcuts
│       └── cars/
│           ├── page.tsx          DataTable of cars (Edit/Delete)
│           ├── new/page.tsx      <CarForm> create
│           └── [id]/edit/page.tsx
├── providers/
│   ├── Providers.tsx             QueryProvider + AuthProvider + Toaster
│   ├── QueryProvider.tsx
│   └── auth/
│       ├── AuthContext.tsx       session restore via /auth/refresh, mutations for login/register/logout, /users/me query
│       ├── useAuth.ts
│       └── RequireAdmin.tsx      client guard for /admin/*
├── entities/
│   ├── auth/model.ts             AuthUser, AuthCredentials, AuthTokens
│   ├── car/model.ts              Car (images: string[]), coverImage(), CAR_CATEGORIES, FALLBACK_CAR_IMAGE
│   ├── service/model.ts
│   └── site/model.ts             SiteContent shape (hero, footer, page intros, …)
├── shared/
│   ├── api/
│   │   ├── axiosInstance.ts      apiPublic + apiProtected (request → bearer; response → 401 → refresh; SSR uses BACKEND_INTERNAL_URL absolute base)
│   │   ├── auth.ts               loginUser, registerUser, logoutUser, getMyProfile, patchMyProfile (normalises role_slugs → roles)
│   │   ├── cars.ts               listCars, getCar, createCar, updateCar, deleteCar, uploadCarImage (presign + PUT)
│   │   ├── services.ts, site.ts, contactRequests.ts
│   │   └── ...
│   ├── components/ui/            Button, Input, Label, Card, Badge, Field, Checkbox, Select, Separator, Table, Avatar, DropdownMenu — shadcn-style on radix-ui
│   ├── lib/
│   │   ├── utils.ts              cn() · withBasePath()
│   │   ├── csrf.ts               read & poll for csrf cookie (used by refresh)
│   │   └── siteContent.ts        splitTitleLines() for "Heading\nWith linebreak"
│   └── hooks/use-mobile.ts
├── features/
│   ├── auth/                     login-form.tsx, signup-form.tsx (presentational)
│   ├── navigation/
│   │   ├── SiteHeader.tsx        scroll-state opacity, RR logo, nav, UserMenu/Sign in, Request a Quote
│   │   ├── SiteFooter.tsx        fed by site_content
│   │   └── UserMenu.tsx          shadcn dropdown (avatar trigger), staggered motion items, slide-in-from-right
│   └── cars/
│       ├── CarCard.tsx           legacy card (kept available; main fleet now renders inline)
│       ├── CarForm.tsx           multi-image uploader (drag-zone + presigned PUT), cover swap, 12-photo cap
│       └── CarGallery.tsx        primary image + thumbnail strip + fullscreen lightbox (←/→/Esc)
└── components/                   (currently empty — old marketing helpers were removed)
```

### Routing & rendering

- App Router, mostly **client components** because pages use `useQuery` + `motion`. Server-only fetching is reserved for `/fleet/[id]` and similar where SEO matters.
- Marketing pages read from `getSiteContent` (`/site/content`) + entity-specific endpoints, with sensible string defaults so the page renders before the API resolves.
- Tailwind v4 with `@theme` block in `app/globals.css`. Custom tokens: `--color-ink`, `--color-dark`, `--color-border`, fonts wired via `--font-inter` / `--font-montserrat` (next/font).

### Auth flow on the client

1. `AuthProvider` mounts → calls `refreshAccessToken()` on first load (CSRF token from cookie + `POST /auth/refresh`); on success populates access token in axios.
2. Protected requests go through `apiProtected` which auto-attaches `Authorization: Bearer …` and retries once on 401 by refreshing.
3. `useAuth()` exposes `user`, `login`, `register`, `logout`, plus loading flags. `user.roles` is normalised from `role_slugs`.
4. `RequireAdmin` redirects to `/auth?from=/admin/...` if not authed, to `/` if authed but no admin role.

### Design system / surface conventions

- **Fonts:** Montserrat for headings (`font-display`, light weight, uppercase, `tracking-[0.05em]–[0.1em]`), Inter for body, uppercase pill-style buttons (`text-[10px–11px] tracking-[0.15em–0.2em]`).
- **Hero pattern:** full-bleed grayscale image + black overlay + centered eyebrow with side-line pseudo-elements + uppercase headline split via `splitTitleLines("Line one\nLine two")`.
- **Cards:** `border border-white/10 bg-[#050505]`, image on top with `grayscale-[0.4]` becoming `grayscale-0` on hover, scale 1.05 on hover, motion `whileInView` slide-in.
- **CTA buttons:** filled white-on-black (primary) and outlined `border-white/30` (secondary), both turn white-bg/black-text on hover.
- **Mobile breakpoints:** start with mobile sizes (`text-4xl`, `gap-3`), step up at `sm:` and `md:`. The hero h1 uses `wrap-break-word text-balance` with explicit `<br>` between lines.

---

## What's been built (chronological highlights)

1. **Backend bootstrap** (template) — auth, RBAC, media storage, admin user mgmt, stats.
2. **Cars MVP** — model, schemas, public list/get + admin CRUD, seeded 4 vehicles in initial migration.
3. **Frontend rewrite** — Vite SPA replaced by Next.js 15 App Router, ported a luxury black/white design.
4. **Profile & auth UX** — `/profile` page, shadcn DropdownMenu `UserMenu` (slide-in-from-right, staggered items), normalises role_slugs.
5. **Site content + services + contact leads** — backend tables, public reads, admin-managed copy; frontend pages consume API with fallbacks.
6. **Multi-image cars** (`d3f1c8a9e210` migration + presign endpoint) — drop `image_url`, store `images TEXT[]`. CarForm drag-zone uploads via presigned PUT, cover swap, 12 max. Fleet card shows "N photos". `/fleet/[id]` got a `CarGallery` with thumbnail strip + fullscreen lightbox (keyboard nav).
7. **UI polish** — admin layout overlap fix (`pt-24` + restyled sub-header), About page image overflow (`lg:aspect-auto`), hero mobile responsiveness (`text-4xl`, `min-h-svh`, always-on `<br>`, `wrap-break-word text-balance`).

Recent commits (local main, all by `luhgeek`):

```
Tighten user menu styling and fix about page image overflow
Add gallery and lightbox to the car detail page
Replace image URL field with file uploader and multi-image gallery hooks
Support multiple images per car
Load marketing pages from backend APIs
Add backend-managed site content and leads
Expose profile link in mobile navigation
Add authenticated profile page
Remove legacy marketing components
```

---

## Common tasks (quick reference)

### Add a new entity (backend)

1. Table: `database/relational_db/tables/<name>/<name>_table.py` + `_table_interface.py` + `__init__.py`. Register in `tables/__init__.py`.
2. Domain: `domain/<name>/` with `enums/` and `schemas/` (Create/Update/Model). Re-export from `__init__.py`.
3. Service: `service/<name>/` with `<name>_service.py` + `exceptions.py` + DI factory in `__init__.py`.
4. Routers: `api/v1/<name>/` (public) and/or `api/v1/admins/<name>/` (gated). Wire into the parent `__init__.py`.
5. Migration: handcraft a revision in `migrations/versions/`. Backfill before dropping.

### Add a frontend page

1. `app/<route>/page.tsx`. Add `"use client"` if you use hooks. Use `useQuery` against `shared/api/<resource>`. Always provide string fallbacks for content fetched from `site_content`.
2. Reuse `splitTitleLines` for two-line headings; add `<br className="hidden md:block">` only when desktop should be 2 lines and mobile 1.
3. Wrap any flex column where text might overflow on mobile with `w-full` on the inner items so they shrink to viewport width (lessons learned from the hero p tag).

### Add an admin-only feature

- Backend: depend on `Depends(require('admin'))`.
- Frontend: nest under `app/admin/...` (which is wrapped by `<RequireAdmin>`). For nav surface, add a link in `SiteHeader.tsx` (`isAdmin` branch) and the `UserMenu` dropdown.

### Add an image-upload field

Use the same pattern as `uploadCarImage` in `shared/api/cars.ts`:

```ts
const { upload_url, public_url } = await api.post(presignEndpoint, { filename, content_type });
await axios.put(upload_url, file, { headers: { "Content-Type": file.type } });
// store public_url in your payload
```

Backend side: extend `CarService.create_image_upload` for the new domain (avatar pattern is the alternative, but the cars endpoint is cleaner since it doesn't tie the upload to a parent record).

---

## Gotchas

- **Pydantic alias on `roles`.** UserModel JSON returns `role_slugs`. Always read `user.role_slugs ?? user.roles ?? []` if you can't import the normalised model from `shared/api/auth.ts`.
- **JWT invalidation.** If you change a user's roles or ban them, also call `user.bump_auth_version()` and commit, or live tokens won't notice the change.
- **`force-dynamic` on RSC pages** that hit the backend is required when running through nginx in dev — Next would otherwise try to prerender and the absolute backend URL has to be available at build time.
- **Tailwind v4 quirks.** Use `wrap-break-word` and `text-balance` (canonical) over `break-words` / `[text-wrap:balance]`. Use `min-h-svh` for hero heights — `h-screen` clips on iOS Safari with the bottom toolbar.
- **`xs:` doesn't exist** by default; smallest is `sm:` (640px). Pre-`sm:` styles are the mobile defaults.
- **MinIO public URL.** Backend signs uploads against `STORAGE_ENDPOINT_PUBLIC=http://localhost`, and nginx proxies `/media-public/` to the internal MinIO. Don't change one without the other.
- **Migrations vs `cars` legacy column.** Don't reintroduce `image_url`. Code reads `car.images[0]`; helper `coverImage(car)` handles the fallback Unsplash placeholder.
- **DropdownMenu animations** rely on `@import "tw-animate-css"` in `globals.css`. If animations stop working after styling changes, that import is the first place to check.

---

## When in doubt

- Backend imports follow `from <layer>.<domain> import …`. Avoid relative imports across layers.
- Frontend path alias: `@/*` → `src/*`.
- Run typecheck/build before reporting done: `cd frontend && npx next build`.
- Smoke-test container changes with `curl http://localhost/api/v1/cars/` after `docker compose up -d`.
