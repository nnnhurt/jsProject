# ===== Base =====
FROM node:20-alpine AS base
WORKDIR /app

# ===== Dependencies =====
FROM base AS deps
COPY package.json package-lock.json* .npmrc* ./
RUN npm ci --ignore-scripts

# ===== Build =====
FROM deps AS build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ===== Runtime =====
FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]


