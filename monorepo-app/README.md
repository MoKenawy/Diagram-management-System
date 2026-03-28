# Node.js Fullstack Monorepo
Using npm workspaces with Backend (Express 5/Node 24) and Frontend (React 19/Vite 6/Tailwind 4).

## Getting Started
1. `npm install`
2. `make docker-up` (Starts DB, Redis, and optionally the containerized apps)
3. `make migrate` (Run DB migrations)
4. `make dev` (Starts dev servers)