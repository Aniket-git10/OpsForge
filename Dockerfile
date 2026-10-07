# Multi-stage production build for OpsForge Backend & Static Assets
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root and package manifests
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd server && npm install
RUN cd client && npm install

# Copy source trees
COPY server ./server
COPY client ./client

# Build backend and frontend
RUN cd server && npm run build
RUN cd client && npm run build

# Production Runner Image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

COPY server/package*.json ./
RUN npm install --only=production

COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/client/dist ./public

EXPOSE 5001

CMD ["node", "dist/index.js"]
