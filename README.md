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

Each room is meant to be its own compose stack (own data directory, own port).

```bash
cp .env.example .env   # set HOST_PORT and DATA_PATH per instance
docker compose up -d --build
```

This builds two images:
- `backend` — multi-stage Node 22 Alpine build, runs the compiled Express app
  against `node:sqlite`. The SQLite file lives at `/app/data` in the
  container, bind-mounted from the host path in `DATA_PATH` (default `./data`
  next to the compose file).
- `frontend` — multi-stage build: `vite build` in a Node stage, served by
  nginx, which also reverse-proxies `/api/*` to the backend container.

Only the frontend's port is published (`HOST_PORT`, default `8080`); the
backend is only reachable inside the compose network.

### Unraid

Requires the Compose Manager (or similar) plugin from Community Apps, since
stock Unraid doesn't run `docker-compose.yml` stacks natively.

Compose Manager keeps the `docker-compose.yml` it runs under its own
`/boot/config/plugins/compose.manager/projects/<name>/` folder — separate
from wherever you actually put this repo. Since `build: ./backend` resolves
relative to the compose file's own location, that split makes the default
build contexts resolve to a path with no `backend`/`frontend` directories in
it, and `docker compose up` fails with something like:

```
unable to prepare context: path "/boot/config/plugins/compose.manager/projects/<name>/backend" not found
```

Fix this by setting `APP_PATH` to wherever you cloned/copied the repo (the
directory containing `backend/` and `frontend/`), so the build contexts
point there instead of alongside the compose file:

```bash
APP_PATH=/mnt/user/appdata/attic-tracking-repo
HOST_PORT=8081
DATA_PATH=/mnt/user/appdata/attic-tracking-kitchen/data
```

Pointing `DATA_PATH` at `/mnt/user/appdata/...` (on the array, not `/mnt/cache`
unless you've set up cache+mover for it) means the SQLite file is a normal
file on disk there, so it's picked up by CA Backup/Restore like any other
appdata. Give each room its own `DATA_PATH` and `HOST_PORT` (and either a
separate checkout directory or a distinct `COMPOSE_PROJECT_NAME`) so the
stacks don't collide.

## Notes / next steps

- Requires Node >= 22.5 for `node:sqlite` (bundled in the backend's Docker image).
- No auth — assumed to run on a trusted local network (e.g. Unraid).
