dev:
	npm run dev --workspaces
build:
	npm run build --workspaces
db-push:
	cd packages/backend && npx prisma db push
migrate:
	cd packages/backend && npx prisma migrate dev
seed:
	cd packages/backend && npx prisma db seed
docker-up:
	docker-compose up -d --build
docker-down:
	docker-compose down
docker-logs:
	docker-compose logs -f
docker-reset:
	docker-compose down -v
