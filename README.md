<div align="center">

# Righteous Rides

**Premium Automotive Services for Luxury &amp; Performance Vehicles.**

Luxury rentals · Professional detailing · Window tint · Vinyl wrap · Chauffeuring · Automotive work — built for clients who expect more than basic.

`Colorado · Denver · Front Range`

</div>

---

## About the brand

Righteous Rides is a premium automotive services brand. It is not a basic car
service company — it works exclusively with high‑end vehicles (Corvette,
Porsche, BMW, Tesla, Lamborghini, McLaren, Mercedes‑AMG) and presents itself
to clients who care about presentation, performance, and a higher standard
of service from start to finish.

The visual direction is intentionally restrained: black background, white
type, a Montserrat display face for headings and an Inter sans for body
copy, large grayscale‑leaning hero photography, uppercase tracking‑wide
labels, and smooth scrolling. No cluttered design, no cheap stock imagery,
no cheesy "best deals in town" language.

## What this repository ships

A full‑stack site for the brand:

- **Public marketing surface** — Home, Services, Fleet, About, Contact, Auth, Profile.
- **Admin console** — fleet management with multi‑photo uploads, inbox of
  quote requests, and CMS‑style control over every page's copy and imagery.
- **Backend API** — FastAPI + PostgreSQL + Redis + MinIO with full RBAC,
  JWT auth (web cookie + mobile body), presigned uploads, rate limits, and
  production‑grade boot guards.

### Page structure

| Route | What it is |
| --- | --- |
| `/` | Hero with luxury vehicle image, "What we do" intro, six service cards, why choose us, CTA. |
| `/services` | Six service lines with descriptions and quote CTAs. |
| `/fleet` | Curated grid of vehicles with photo counts and category badges. |
| `/fleet/[id]` | Vehicle gallery + lightbox, highlights, price/day, "Check Availability". |
| `/about` | Brand story, mission, premium promise. |
| `/contact` | Multi‑field quote form (Full Name, Phone, Email, Service, Vehicle Type, Preferred Date, Message). |
| `/auth` | Sign in / register. |
| `/profile` | View account, update username. |
| `/admin` | Fleet count, request count, latest leads at a glance. |
| `/admin/cars` | CRUD with drag‑zone multi‑photo upload (up to 12, JPEG/PNG/WebP). |
| `/admin/requests` | Searchable inbox of every contact‑form submission. |

### Tariff‑first contact flow

Clicking **Check Availability** on a vehicle detail page passes `?car=<id>`
to `/contact`. The form fetches the car, prefills *Vehicle Type*, and
renders a `Selected: <car> · Year · $/day` chip above the inputs. Submit
writes to `contact_requests` in PostgreSQL; the admin sees it instantly in
`/admin/requests`.

## Stack

| Layer | Tech |
| --- | --- |
| Backend | Python 3.13 · FastAPI · SQLAlchemy 2 (async) · Alembic · Pydantic v2 |
| Database | PostgreSQL 17 |
| Cache / rate limit | Redis 8 |
| Object storage | MinIO (S3‑compatible), presigned PUT uploads to a `media-public` bucket |
| Auth | JWT (RS256, access + refresh), httpOnly cookie for web + CSRF, body tokens for mobile, role table (`admin`, `member`) |
| Frontend | Next.js 15 (App Router) · React 19 · TypeScript |
| UI | Tailwind v4 · tw‑animate‑css · shadcn‑style primitives on `radix-ui` · `lucide-react` |
| Animation | `motion/react` (Framer Motion v12) |
| Data fetching | TanStack Query · axios |
| Forms | `react-hook-form` + Zod |
| Edge | nginx (reverse proxy, ports 80 → 3000 / 8080 / 9000) |

## Run it locally

```bash
docker compose up --build -d
```

Then open:

| Surface | URL |
| --- | --- |
| Frontend | <http://localhost> |
| API docs (Swagger) | <http://localhost/api/docs> |
| MinIO console | <http://localhost:9001> · `minioadmin` / `minioadmin` |

Alembic migrations run automatically on backend container start
(`backend/entry.sh`). Four sample vehicles plus the marketing services and
site‑content blob are seeded by the initial migrations, so `/fleet` and
`/services` work out of the box.

### Promote a user to admin

After registering at `/auth`:

```bash
docker compose exec -T db psql -U postgres -d templatepg -c \
  "INSERT INTO user_roles (user_id, role_id)
   SELECT u.id, r.id FROM users u, roles r
   WHERE u.email='you@example.com' AND r.slug='admin';"
```

## Architecture

```
.
├── backend/              FastAPI app (api / domain / service / database)
├── frontend/             Next.js 15 App Router
├── nginx/                Reverse proxy
├── docker-compose.yml    backend · frontend · nginx · postgres · redis · minio · minio-init
├── AGENTS.md             Detailed onboarding & conventions for future contributors
└── README.md             You are here
```

The backend follows a feature‑sliced layout with one file per route handler,
a service layer composing a Unit‑of‑Work + repo per table, and Pydantic
schemas at the API boundary. The frontend uses the App Router with
client‑side data fetching through TanStack Query; SSR is reserved for SEO
surfaces like `/fleet/[id]`.

Detailed onboarding for new contributors — directory map, route inventory,
auth flow, design tokens, gotchas — lives in [`AGENTS.md`](./AGENTS.md).

## Backend API at a glance

`/api/v1` mounts the following groups:

- **Auth** — `register` · `login` · `refresh` · `logout`
- **Current user** — `GET /users/me` · `PATCH /users/me` · avatar presign / confirm / delete
- **Public** — `GET /cars` · `GET /cars/{id}` · `GET /services` · `GET /site/content` · `POST /contact-requests`
- **Admin** (require `admin`) — cars CRUD + image presign, contact requests inbox, user list / ban / role assignment, registration stats
- **System** — `/api/ping` · `/api/health` · `/api/ready`

Highlights from recent hardening:

- JWT verification requires `exp`, `jti`, `sub`, `typ` and falls back to a
  per‑IP rate bucket when the refresh token is missing or invalid.
- `X-Client: mobile` is rejected when browser‑set headers (`Origin`,
  `Referer`, `Sec-Fetch-*`) are present, so an XSS cannot read the refresh
  token out of a JSON body.
- The public `/contact-requests/` form is throttled at 5 req/min per IP.
- Every car image URL submitted by an admin is verified against MinIO — the
  object must exist in our public bucket, the content type must be JPEG /
  PNG / WebP, and the size must be ≤ `MAX_PHOTO_SIZE`.
- Production boot refuses to start when `DEBUG=true`, `COOKIE_SECURE=false`,
  the CSRF key is still the default, or storage credentials are still
  `minioadmin`. Swagger / ReDoc / `openapi.json` are disabled in prod.

## Frontend highlights

- **Mobile‑first marketing pages.** Hero, services, fleet and about scale
  fluidly from `text-5xl` on phones up to `text-8xl` on `lg:`. Word‑level
  `<br className="sm:hidden">` keeps the hero headline three‑line on small
  viewports without overflow.
- **Backend‑driven copy.** Hero, intro, why‑choose, page intros, footer,
  contact info and social links all read from `site_content`. There is no
  hard‑coded fallback content — if a field is empty in the database, that
  block simply doesn't render.
- **Multi‑photo car uploader.** Admins pick JPEG / PNG / WebP files from
  their device; the form requests a presigned PUT URL per file, uploads
  straight to MinIO, then commits the array of public URLs. The first image
  is the cover; admins can promote any other image with one click, remove
  any, and reorder before saving (12‑photo cap).
- **Vehicle gallery with lightbox.** `/fleet/[id]` renders a primary image
  plus thumbnail strip; click the primary or press a thumbnail to open a
  full‑screen lightbox with keyboard navigation (`←` / `→` / `Esc`).
- **Profile dropdown.** Avatar trigger opens a compact shadcn‑style menu
  with `Profile`, `Admin` (when applicable), and `Sign out`. Slides in from
  the right with staggered item reveal.

## Production checklist

Before deploying:

1. Set `APP_STAGE=prod`. The backend will refuse to start unless the
   `DEBUG / COOKIE_SECURE / CSRF_HMAC_KEY / STORAGE_*` guards pass.
2. Rotate `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` (or point to mounted PEM
   paths via `JWT_PRIVATE_KEY_PATH` / `JWT_PUBLIC_KEY_PATH`).
3. Replace MinIO credentials and the CSRF key with real values.
4. Update `frontend/next.config.ts` `images.remotePatterns` to your real
   media domain — `localhost` / `127.0.0.1` entries are dev‑only.
5. Make sure the backend container is **not** publicly exposed on its raw
   port; everything should reach it through nginx so `X-Real-IP` is
   trustworthy for rate limiting.

