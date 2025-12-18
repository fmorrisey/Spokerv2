FROM node:20-alpine AS builder

WORKDIR /app
# Install deps
COPY package.json package-lock.json ./
RUN npm ci --production=false

# Copy everything and build
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app

# Install only production deps
COPY package.json package-lock.json ./
RUN npm ci --production=true

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
EXPOSE 5001

CMD ["node", "dist/server.js"]

