#!/bin/sh

# Khởi tạo .env nếu chưa có
if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
fi

# Chờ database sẵn sàng
echo "Waiting for database to be ready..."
until nc -z db 5432; do
  sleep 1
done
echo "Database is ready!"

# Khởi tạo database (push schema và seed data nếu cần)
echo "Initializing database..."
npx prisma db push --accept-data-loss
npx prisma db seed

# Bắt đầu ứng dụng
echo "Starting application..."
exec node server.js
