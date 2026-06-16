# syntax=docker/dockerfile:1
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build:mock

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=8080 \
    STATIC_ROOT=/app/build/client \
    ALLOW_TEST_ENDPOINTS=true
COPY --from=builder /app/build/client ./build/client
COPY --from=builder /app/mock-server ./mock-server
EXPOSE 8080
CMD ["node", "mock-server/server.mjs"]
