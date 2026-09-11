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

SQLite file is written to `backend/data/attic.db` (override with `DATA_DIR`).

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

Each room is meant to be its own compose stack (own SQLite volume, own port).

```bash
cp .env.example .env   # set HOST_PORT per instance
docker compose up -d --build
```

This builds two images:
- `backend` — multi-stage Node 22 Alpine build, runs the compiled Express app
  against `node:sqlite`, data persisted to a named volume (`/app/data`).
- `frontend` — multi-stage build: `vite build` in a Node stage, served by
  nginx, which also reverse-proxies `/api/*` to the backend container.

Only the frontend's port is published (`HOST_PORT`, default `8080`); the
backend is only reachable inside the compose network. For a second room,
copy the repo (or use a separate `.env`/`COMPOSE_PROJECT_NAME`) so each
instance gets its own volume and port.

## Notes / next steps

- Requires Node >= 22.5 for `node:sqlite` (bundled in the backend's Docker image).
- No auth — assumed to run on a trusted local network (e.g. Unraid).
