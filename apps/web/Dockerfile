# syntax=docker/dockerfile:1

# ---------- Dependencias de build (completas) ----------
FROM node:26-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/contracts/package.json ./packages/contracts/package.json
RUN npm ci

# ---------- Build ----------
FROM node:26-alpine AS build
WORKDIR /app
ARG VITE_API_URL
ARG VITE_EVENTS_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_EVENTS_URL=$VITE_EVENTS_URL
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build -w @skrd/contracts
RUN npm run build -w web

# ---------- Dependencias de producción (solo web + contracts) ----------
FROM node:26-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/contracts/package.json ./packages/contracts/package.json
RUN npm ci --omit=dev

# ---------- Runtime ----------
FROM node:26-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/contracts/package.json ./packages/contracts/package.json
COPY --from=prod-deps /app/node_modules ./node_modules

COPY --from=build /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=build /app/apps/web/build ./apps/web/build

EXPOSE 3000
CMD ["npm", "run", "start", "-w", "web"]
