#!/bin/sh
set -eu

cd /var/www/html

# Create and persist Laravel environment
if [ ! -f /runtime/.env ]; then
    cp .env.example /runtime/.env
fi

ln -sfn /runtime/.env /var/www/html/.env

# Generate Laravel application key if missing
if ! grep -q '^APP_KEY=base64:' /runtime/.env; then
    php artisan key:generate --force --no-interaction
fi

# Prepare database
php artisan migrate --force

# Insert sample data
php artisan db:seed --force

# Start PHP-FPM
exec "$@"