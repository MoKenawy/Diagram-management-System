FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
RUN npm install --workspace=@app/backend
COPY packages/backend ./packages/backend
RUN cd packages/backend && npx prisma generate && npm run build

FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/packages/backend/prisma ./prisma
EXPOSE 3000
CMD ["node", "dist/index.js"]