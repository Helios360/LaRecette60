# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY la-recette/package*.json la-recette/bun.lock ./
RUN npm ci
COPY la-recette/ .
RUN npm run build

# Runtime stage
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/static ./static
RUN mkdir -p /app/uploads

EXPOSE 3000
CMD ["node", "build"]