.PHONY: dev build migrate seed docker-up docker-down

dev:
	npm run dev --workspaces

build:
	npm run build --workspaces

migrate:
	cd packages/backend && npx prisma migrate dev

seed:
	cd packages/backend && npx prisma db seed

docker-up:
	docker-compose up -d --build

docker-down:
	docker-compose down