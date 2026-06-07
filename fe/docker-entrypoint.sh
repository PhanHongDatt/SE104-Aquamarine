#!/bin/sh

echo "Waiting for database to be ready..."
until nc -z db 5432; do
  sleep 1
done
echo "Database is ready!"

echo "Initializing database schema..."
npx prisma@5.22.0 db push --skip-generate

echo "Seeding database if it is empty..."
node prisma/seed.js --if-empty

echo "Starting application..."
exec node start.js
