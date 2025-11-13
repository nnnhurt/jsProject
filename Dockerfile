# ===== Base =====
FROM node:20-alpine AS base
WORKDIR /app

# ===== Dependencies =====
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# ===== Build =====
FROM deps AS build
COPY package.json tsconfig.json ./
COPY src ./src
RUN npm run build

# ===== Runtime =====
FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]

# ===== Development =====
FROM base AS development
WORKDIR /app
RUN apk add --no-cache dumb-init
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
ENTRYPOINT ["dumb-init"]
CMD ["npm", "run", "dev"]


