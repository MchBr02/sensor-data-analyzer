#!/bin/sh
#wait-for-mongo.sh

# Wait until Mongo is ready
until mongo --host "$MONGODB_HOST_ADRESS" --port "$MONGODB_HOST_PORT" -u "$MONGODB_ADMIN_USER" -p "$MONGODB_ADMIN_PASS" --authenticationDatabase admin --eval "db.adminCommand('ping')" >/dev/null 2>&1; do
  echo "⏳ Waiting for MongoDB at $MONGODB_HOST_ADRESS:$MONGODB_HOST_PORT..."
  sleep 2
done

echo "✅ MongoDB is ready!"

# Run the Deno app
deno task start