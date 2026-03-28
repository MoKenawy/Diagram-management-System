FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY packages/frontend/package.json ./packages/frontend/
RUN npm install --workspace=packages/frontend
COPY packages/frontend ./packages/frontend
WORKDIR /app/packages/frontend
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]