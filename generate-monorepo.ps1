<#
.SYNOPSIS
    Generates a Node.js 24 Monorepo with NPM Workspaces
    Backend: Express 5, TS 6.0, Prisma 7, BullMQ, Redis, Postgres
    Frontend: React 19, TS 6.0, Vite 6, Tailwind 4, Shadcn, TanStack Query v5
#>

$projectName = "monorepo-app"

# Helper to write clean UTF-8 without BOM
function Write-Utf8File {
    param (
        [string]$FilePath,
        [string]$Content
    )
    $FullPath = [System.IO.Path]::GetFullPath((Join-Path (Get-Location) "$projectName/$FilePath"))
    $Dir = [System.IO.Path]::GetDirectoryName($FullPath)
    if (-not (Test-Path $Dir)) {
        New-Item -ItemType Directory -Path $Dir -Force | Out-Null
    }
    $Utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($FullPath, $Content, $Utf8NoBom)
    Write-Host "Created: $FilePath" -ForegroundColor Green
}

Write-Host "Initializing Monorepo in ./$projectName..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path $projectName -Force | Out-Null

# =========================================================
# 1. ROOT LEVEL FILES
# =========================================================

$rootPackageJson = @'
{
  "name": "monorepo-root",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "npm run dev --workspaces",
    "build": "npm run build --workspaces",
    "lint": "npm run lint --workspaces",
    "format": "npm run format --workspaces"
  }
}
'@
Write-Utf8File "package.json" $rootPackageJson

$envExample = @'
DATABASE_URL="postgresql://user:password@postgres:5432/appdb"
REDIS_URL="redis://redis:6379"
PORT=3000
FRONTEND_URL="http://localhost:80"
JWT_SECRET="supersecret_jwt_key_change_me"
JWT_REFRESH_SECRET="supersecret_refresh_key_change_me"
FILE_STORAGE_PATH="./uploads"
BACKUP_PATH="./backups"
'@
Write-Utf8File ".env.example" $envExample
Write-Utf8File ".env" $envExample

$dockerCompose = @'
version: '3.8'
services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: appdb
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7.4
    ports:
      - "6379:6379"

  backend:
    build:
      context: .
      dockerfile: packages/backend/Dockerfile
    ports:
      - "3000:3000"
    env_file: .env
    depends_on:
      - postgres
      - redis

  frontend:
    build:
      context: .
      dockerfile: packages/frontend/Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  pgdata:
'@
Write-Utf8File "docker-compose.yml" $dockerCompose

# Using double quotes to evaluate the tab character (`t) for the Makefile
$makefile = @"
.PHONY: dev build migrate seed docker-up docker-down

dev:
`tnpm run dev --workspaces

build:
`tnpm run build --workspaces

migrate:
`tcd packages/backend && npx prisma migrate dev

seed:
`tcd packages/backend && npx prisma db seed

docker-up:
`tdocker-compose up -d --build

docker-down:
`tdocker-compose down
"@
Write-Utf8File "Makefile" $makefile

$readme = @'
# Node.js Fullstack Monorepo
Using npm workspaces with Backend (Express 5/Node 24) and Frontend (React 19/Vite 6/Tailwind 4).

## Getting Started
1. `npm install`
2. `make docker-up` (Starts DB, Redis, and optionally the containerized apps)
3. `make migrate` (Run DB migrations)
4. `make dev` (Starts dev servers)
'@
Write-Utf8File "README.md" $readme

# =========================================================
# 2. BACKEND FILES (Express 5, Node 24, Prisma 7, TS 6.0)
# =========================================================

$backendPackageJson = @'
{
  "name": "@monorepo/backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint .",
    "format": "prettier --write \"src/**/*.ts\""
  },
  "dependencies": {
    "@prisma/client": "^7.0.0",
    "axios": "^1.7.0",
    "bcrypt": "^5.1.1",
    "bullmq": "^5.0.0",
    "cors": "^2.8.5",
    "express": "^5.0.0",
    "helmet": "^8.0.0",
    "ioredis": "^5.4.0",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.33.0"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/multer": "^1.4.11",
    "@types/node": "^24.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "prisma": "^7.0.0",
    "tsx": "^4.0.0",
    "typescript": "^6.0.0"
  }
}
'@
Write-Utf8File "packages/backend/package.json" $backendPackageJson

$backendTsconfig = @'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
'@
Write-Utf8File "packages/backend/tsconfig.json" $backendTsconfig

$backendIndex = @'
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Backend API Running', status: 'OK' });
});

app.listen(port, () => {
    console.log(`🚀 Backend Server running on http://localhost:${port}`);
});
'@
Write-Utf8File "packages/backend/src/index.ts" $backendIndex

$prismaSchema = @'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
}
'@
Write-Utf8File "packages/backend/prisma/schema.prisma" $prismaSchema

$backendDockerfile = @'
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
'@
Write-Utf8File "packages/backend/Dockerfile" $backendDockerfile

$eslintConfig = @'
import js from "@eslint/js";
export default [
  js.configs.recommended,
  { rules: { "no-console": "off", "no-unused-vars": "warn" } }
];
'@
Write-Utf8File "packages/backend/eslint.config.mjs" $eslintConfig
Write-Utf8File "packages/frontend/eslint.config.mjs" $eslintConfig

$prettierConfig = @'
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all"
}
'@
Write-Utf8File "packages/backend/.prettierrc" $prettierConfig
Write-Utf8File "packages/frontend/.prettierrc" $prettierConfig

# =========================================================
# 3. FRONTEND FILES (React 19, TS 6.0, Vite 6, Tailwind 4)
# =========================================================

$frontendPackageJson = @'
{
  "name": "@monorepo/frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\""
  },
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.7.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.300.0",
    "pdfjs-dist": "^4.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router": "^7.0.0",
    "tailwind-merge": "^2.0.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@types/node": "^24.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^6.0.0",
    "vite": "^6.0.0"
  }
}
'@
Write-Utf8File "packages/frontend/package.json" $frontendPackageJson

$frontendTsconfig = @'
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"]
}
'@
Write-Utf8File "packages/frontend/tsconfig.json" $frontendTsconfig

$viteConfig = @'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
'@
Write-Utf8File "packages/frontend/vite.config.ts" $viteConfig

$frontendIndexCss = @'
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
}
'@
Write-Utf8File "packages/frontend/src/index.css" $frontendIndexCss

$frontendMain = @'
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
'@
Write-Utf8File "packages/frontend/src/main.tsx" $frontendMain

$frontendApp = @'
import { BrowserRouter, Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <div className="flex items-center justify-center h-screen bg-slate-50">
              <div className="p-8 shadow-lg rounded-xl bg-white text-center space-y-4">
                <h1 className="text-4xl font-bold text-primary">Frontend App</h1>
                <p className="text-gray-500">React 19 + Tailwind CSS 4 + Vite 6</p>
              </div>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
'@
Write-Utf8File "packages/frontend/src/App.tsx" $frontendApp

$indexHtml = @'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Monorepo App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
'@
Write-Utf8File "packages/frontend/index.html" $indexHtml

$shadcnConfig = @'
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
'@
Write-Utf8File "packages/frontend/components.json" $shadcnConfig

$nginxConf = @'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
'@
Write-Utf8File "packages/frontend/nginx.conf" $nginxConf

$frontendDockerfile = @'
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
'@
Write-Utf8File "packages/frontend/Dockerfile" $frontendDockerfile

Write-Host "`n✅ Monorepo successfully scaffolded in './$projectName'." -ForegroundColor Green
Write-Host "👉 Next steps:" -ForegroundColor Yellow
Write-Host "   cd $projectName"
Write-Host "   npm install"
Write-Host "   make dev"