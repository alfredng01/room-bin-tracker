# Attic Tracking

Overview of what's stored in a room: freestanding items and items packed
into labeled containers (bags/boxes/totes). Intended to be spun up as one
instance per room.

## Structure

- `backend/` — Express API + SQLite (via Node's built-in `node:sqlite`), TypeScript
- `frontend/` — React + Vite + TypeScript + Mantine

## Running locally

Backend (http://localhost:3001):

```bash
cd backend
npm install
npm run dev
```

Frontend (http://localhost:5173, proxies `/api` to the backend):

```bash
cd frontend
npm install
npm run dev
```

## Data model

- **Container**: `id`, `label` (defaults to `Box N`), `created_at`
- **Item**: `id`, `name`, `quantity` (defaults to 1), `container_id` (null = freestanding), `created_at`

SQLite file is written to `backend/data/attic.db` in local dev (override
with `DATA_DIR`), or wherever `DATA_PATH` is bind-mounted to under Docker
(see below).

## Pagination

`GET /api/items?page=1&limit=10` returns freestanding items one page at a time
(default 10, max 100) as `{ items, total, page, limit, totalPages }`. An
out-of-range page is clamped to the last page. The home page shows 10 per page
and jumps to the last page after you add an item, since new items sort last.

## Search

`GET /api/search?q=...` matches item names (case-insensitive substring) and
returns two lists: matching freestanding items, and the containers that hold
at least one matching item (with a match count) — not the matched item itself,
since the point is to tell you which container to go dig through.

## Styling

Mantine is used in "headless" mode: `@mantine/core/styles.css` is never
imported, so Mantine components ship with zero default CSS and only provide
behavior (focus handling, aria attributes, controlled value plumbing, etc).
All visual styling lives in [`frontend/src/styles/tokens.css`](frontend/src/styles/tokens.css)
(CSS variables) and [`frontend/src/styles/ui.module.css`](frontend/src/styles/ui.module.css)
(a CSS module of small utility classes — `.btn`, `.input`, `.card`, layout
helpers, etc.), applied via each component's `className`/`classNames` props.
To restyle something, edit those two files — no fighting Mantine's own
stylesheet or specificity.

## Docker / deployment

The whole app ships as **one image**, `ghcr.io/alfredng01/room-bin-tracker`.
A multi-stage [`Dockerfile`](Dockerfile) at the repo root builds the frontend
and the backend, and the runtime stage is a single Express server that serves
the built UI and `/api/*` on port 3001. The SQLite file lives at `/app/data`
in the container, bind-mounted from `DATA_PATH` on the host.

Each room is its own compose stack (own data directory, own port):

```bash
cp .env.example .env   # set HOST_PORT and DATA_PATH per instance
docker compose up -d   # pulls the image from GHCR
```

To build from your local checkout instead of pulling:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

### CI/CD

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every push and PR:

1. **Frontend build** and **Backend build** run in parallel (`npm ci` plus
   `npm run build`; the frontend build includes `tsc` type-checking).
2. **Build & push image** runs only when both pass, and only on pushes to
   `main`. It pushes `ghcr.io/alfredng01/room-bin-tracker` tagged `latest` and
   `sha-<short-commit>`, for `linux/amd64`. PRs get the build checks but never
   publish.

The workflow authenticates with the built-in `GITHUB_TOKEN`, so no secrets
need to be configured in the repo.

### Unraid

Requires the Compose Manager (or similar) plugin from Community Apps. Only
`docker-compose.yml` and a `.env` are needed on the server, with no repo copy
and no rsync. Example `.env` per room:

```bash
IMAGE_TAG=latest
HOST_PORT=8081
DATA_PATH=/mnt/user/appdata/attic-tracking-kitchen/data
```

**Updating after a push to `main`:** wait for the CI run to go green, then
use Compose Manager's **Update Stack** (or run `docker compose pull && docker
compose up -d`). Your data is untouched because it lives in `DATA_PATH`, not
in the image. To hold a room on a known-good version, set `IMAGE_TAG` to a
`sha-…` tag from the package page instead of `latest`.

**Package visibility:** GHCR packages are private by default. Either:
- make it public (GitHub → your profile → Packages → room-bin-tracker →
  Package settings → Change visibility), or
- keep it private and log Unraid in once: create a classic personal access
  token with only the `read:packages` scope, then on the Unraid terminal run
  `docker login ghcr.io -u alfredng01` and paste the token as the password.

Pointing `DATA_PATH` at `/mnt/user/appdata/...` means the SQLite file is a
normal file on the array, so CA Backup/Restore picks it up like any other
appdata. Give each room its own `DATA_PATH` and `HOST_PORT` (and its own
Compose Manager stack) so the stacks don't collide.

### Cloudflare Tunnel

The app is a single origin, and the frontend only uses relative URLs. So one
tunnel hostname is all that's needed, with no CORS or API-URL settings.

With an existing `cloudflared` (Zero Trust dashboard → Networks → Tunnels →
your tunnel → Public Hostname):

- Hostname: e.g. `attic.example.com`
- Service: `HTTP` → `<unraid-ip>:<HOST_PORT>` (e.g. `192.168.1.10:8081`).
  If cloudflared runs on the same Docker network as the stack, `app:3001`
  works too.

**The app has no login of its own**, so put Cloudflare Access in front of it
(Zero Trust → Access → Applications → Add → Self-hosted): use the same
hostname, add a policy such as "Allow — emails ending in @yourdomain" or a
specific list of emails. Without this, anyone who finds the URL can edit the
inventory. One Access application per room hostname.

## Notes / next steps

- Requires Node >= 22.5 for `node:sqlite` (bundled in the Docker image).
- No auth of its own — rely on Cloudflare Access (above) when exposed.
