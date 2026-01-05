#!/bin/bash

# ===================================
# LocalServices - Auto Deployment Script
# ===================================
# Użycie: ./deploy.sh [environment]
# Przykład: ./deploy.sh production
# ===================================

set -e  # Exit on error

ENV=${1:-production}
PROJECT_DIR="/var/www/localservices"

echo "🚀 Starting deployment for environment: $ENV"
echo "─────────────────────────────────────────────"

# Navigate to project
cd $PROJECT_DIR

# 1. Maintenance mode
echo "📦 Enabling maintenance mode..."
php artisan down || true

# 2. Pull latest code
echo "📥 Pulling latest code from Git..."
git pull origin main

# 3. Install backend dependencies
echo "📦 Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction

# 4. Install frontend dependencies
echo "📦 Installing NPM dependencies..."
npm ci --production

# 5. Build frontend
echo "🏗️  Building frontend assets..."
npm run build

# 6. Run database migrations
echo "🗄️  Running database migrations..."
php artisan migrate --force --env=$ENV

# 7. Clear caches
echo "🧹 Clearing old caches..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# 8. Optimize for production
echo "⚡ Optimizing for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 9. Restart queue workers
echo "🔄 Restarting queue workers..."
sudo supervisorctl restart localservices-worker:* || echo "⚠️  Supervisor not configured"

# 10. Reload PHP-FPM
echo "🔄 Reloading PHP-FPM..."
sudo systemctl reload php8.2-fpm || sudo systemctl reload php-fpm || echo "⚠️  PHP-FPM reload failed"

# 11. Clear application cache
echo "🧹 Clearing application cache..."
php artisan cache:clear

# 12. Disable maintenance mode
echo "✅ Disabling maintenance mode..."
php artisan up

echo ""
echo "─────────────────────────────────────────────"
echo "✅ Deployment complete!"
echo "🌐 Application: $APP_URL"
echo "📊 Check logs: tail -f storage/logs/laravel.log"
echo "─────────────────────────────────────────────"
