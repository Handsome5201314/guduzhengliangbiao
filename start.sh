#!/bin/sh

# Push the Prisma schema to the database
# This ensures the SQLite database has the correct tables
npx prisma db push

# Start the Next.js standalone server
node server.js
