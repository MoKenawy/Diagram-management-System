# Stage 1: Build React App
FROM node:24-alpine AS builder
WORKDIR /app

# Copy root dependency files
COPY package*.json ./
# Copy frontend dependency files
COPY packages/frontend/package*.json ./packages/frontend/

# Install using workspace
RUN npm install --workspace=@app/frontend

# Copy source and build
COPY packages/frontend ./packages/frontend
WORKDIR /app/packages/frontend
RUN npm run build

# Stage 2: Serve with NGINX
FROM nginx:alpine
# Copy built assets from builder stage
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

# Copy our custom nginx config
# Note: Ensure the path nginx/nginx.conf is correct relative to root
COPY nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]