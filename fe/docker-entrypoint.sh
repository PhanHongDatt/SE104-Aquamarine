#!/bin/sh

# Chờ database sẵn sàng
echo "Waiting for database to be ready..."
until nc -z db 5432; do
  sleep 1
done
echo "Database is ready!"

# Khởi tạo database schema (--skip-generate tránh ghi đè @prisma/client đã build sẵn)
echo "Initializing database schema..."
npx prisma db push --accept-data-loss --skip-generate

# Chạy seed data (dùng compiled JS, không cần ts-node)
echo "Seeding database..."
node prisma/seed.js

# Bắt đầu ứng dụng
echo "Starting application..."
exec node server.js
