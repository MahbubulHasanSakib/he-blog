# Stage 1: Build
FROM node:20-slim AS builder
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install all dependencies (dev + prod), ignore engine constraints
RUN yarn install --ignore-engines

# Copy app source
COPY . .

# Build the app (NestJS)
RUN yarn build

# Stage 2: Production image
FROM node:20-slim
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install runtime dependencies only
RUN yarn install --ignore-engines

# Copy compiled files from build stage
COPY --from=builder /app/dist ./dist

# Use non-root user for better security
USER node

# Expose internal port (should match what your app listens on)
EXPOSE 3000

# Default command: run compiled JS
CMD ["node", "dist/main.js"]
