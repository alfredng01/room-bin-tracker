# syntax=docker/dockerfile:1

FROM node:22-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:22-alpine AS backend-build
WORKDIR /backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3001 \
    DATA_DIR=/app/data \
    PUBLIC_DIR=/app/public

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=backend-build /backend/dist ./dist
COPY --from=frontend-build /frontend/dist ./public

RUN mkdir -p /app/data
VOLUME ["/app/data"]

EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -qO- http://localhost:3001/api/health || exit 1
CMD ["node", "dist/index.js"]
