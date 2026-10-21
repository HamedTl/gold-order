FROM php:8.3-fpm

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       git unzip libzip-dev libonig-dev \
    && docker-php-ext-install \
       pdo_mysql bcmath mbstring zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY api-app/composer.json api-app/composer.lock ./

RUN composer install \
    --no-interaction \
    --prefer-dist \
    --no-progress \
    --no-scripts

COPY api-app/ ./

RUN composer dump-autoload --optimize \
    && mkdir -p storage/framework/cache \
                storage/framework/sessions \
                storage/framework/views \
                storage/logs \
                bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

COPY docker/backend/entrypoint.sh /usr/local/bin/backend-entrypoint

RUN chmod +x /usr/local/bin/backend-entrypoint

EXPOSE 9000

ENTRYPOINT ["backend-entrypoint"]
CMD ["php-fpm"]