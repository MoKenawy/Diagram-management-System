FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY packages/backend/package.json ./packages/backend/
RUN npm install --workspace=packages/backend
COPY packages/backend ./packages/backend
WORKDIR /app/packages/backend
RUN npx prisma generate
RUN npm run build

FROM node:24-alpine
WORKDIR /app
COPY package.json ./
COPY packages/backend/package.json ./packages/backend/
RUN npm install --workspace=packages/backend --omit=dev
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/backend/prisma ./packages/backend/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
WORKDIR /app/packages/backend
EXPOSE 3000
CMD ["npm", "start"]