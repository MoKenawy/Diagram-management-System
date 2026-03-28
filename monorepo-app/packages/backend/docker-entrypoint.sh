#!/bin/sh

# Wait for database to be ready (Optional but recommended)
echo "Waiting for database to be ready..."

# Run migrations
# We use 'deploy' instead of 'dev' in environments to avoid interactive prompts

# echo "Running database migrations..."
# npx prisma migrate deploy

# Use 'migrate deploy' if you have migration files, 
# otherwise 'db push' for rapid prototyping
npx prisma db push 

# Run seed (optional - remove if you don't want to seed every time)
echo "Seeding database..."
npx prisma db seed

# Start the application
echo "Starting the application..."
node dist/index.js