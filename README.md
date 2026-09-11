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

## Notes / next steps

- Requires Node >= 22.5 for `node:sqlite`.
- Mantine is wired up with its default styling for now; true "headless"
  styling (unstyled components + custom CSS) can be layered in later.
- No auth — assumed to run on a trusted local network (e.g. Unraid).
- Dockerization not yet done; planned for deployment on Unraid.
