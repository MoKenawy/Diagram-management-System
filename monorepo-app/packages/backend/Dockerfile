# --- Builder Stage ---
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
RUN npm install --workspace=@app/backend
COPY packages/backend ./packages/backend
# Generate Prisma client and build JS
RUN cd packages/backend && npx prisma generate && npm run build

# --- Runner Stage ---
FROM node:24-alpine
WORKDIR /app

# 1. Copy dependencies and built code
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/packages/backend/src ./src
COPY --from=builder /app/packages/backend/prisma ./prisma
COPY --from=builder /app/packages/backend/prisma*.config*.ts ./
COPY --from=builder /app/packages/backend/package*.json ./
COPY --from=builder /app/packages/backend/swagger*.yaml ./
RUN mkdir -p ./output

# 2. Copy the entrypoint script from your local packages/backend folder
# Make sure this file exists in your packages/backend folder on Windows!
COPY packages/backend/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

# 3. Use the entrypoint script to handle migrations + starting the app
ENTRYPOINT ["docker-entrypoint.sh"]