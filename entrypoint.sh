#!/bin/sh

# Print environment variables for debugging
echo "DATABASE_URL is: $DATABASE_URL"
echo "DB_HOST is: $DB_HOST"
echo "POSTGRES_DB is: $POSTGRES_DB"

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 0.1
done
echo "PostgreSQL is ready"

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting the application..."
npm run start:prod