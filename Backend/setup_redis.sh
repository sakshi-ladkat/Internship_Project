#!/bin/bash

# Redis Setup Script for Laravel Project
# This script installs and configures Redis for the registration draft cache system

echo "=========================================="
echo "Redis Setup for Registration Draft Cache"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run with sudo: sudo bash setup_redis.sh"
    exit 1
fi

# Update package list
echo "Step 1: Updating package list..."
apt update

# Install Redis Server
echo ""
echo "Step 2: Installing Redis Server..."
apt install -y redis-server

# Install Redis Tools (CLI)
echo ""
echo "Step 3: Installing Redis Tools..."
apt install -y redis-tools

# Install PHP Redis Extension
echo ""
echo "Step 4: Installing PHP Redis Extension..."
apt install -y php-redis

# Configure Redis to start on boot
echo ""
echo "Step 5: Configuring Redis to start on boot..."
systemctl enable redis-server

# Start Redis Server
echo ""
echo "Step 6: Starting Redis Server..."
systemctl start redis-server

# Check Redis status
echo ""
echo "Step 7: Checking Redis status..."
systemctl status redis-server --no-pager

# Test Redis connection
echo ""
echo "Step 8: Testing Redis connection..."
redis-cli ping

# Check PHP Redis extension
echo ""
echo "Step 9: Checking PHP Redis extension..."
php -m | grep redis

# Restart PHP-FPM (adjust version as needed)
echo ""
echo "Step 10: Restarting PHP-FPM..."
PHP_VERSION=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;")
systemctl restart php${PHP_VERSION}-fpm 2>/dev/null || echo "PHP-FPM restart skipped (not running or different version)"

# Test Redis with PHP
echo ""
echo "Step 11: Testing Redis with PHP..."
php -r "
try {
    \$redis = new Redis();
    \$redis->connect('127.0.0.1', 6379);
    \$redis->set('test_key', 'test_value');
    \$value = \$redis->get('test_key');
    \$redis->del('test_key');
    echo 'PHP Redis Test: ' . (\$value === 'test_value' ? 'SUCCESS' : 'FAILED') . PHP_EOL;
} catch (Exception \$e) {
    echo 'PHP Redis Test: FAILED - ' . \$e->getMessage() . PHP_EOL;
}
"

echo ""
echo "=========================================="
echo "Redis Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Verify .env has: CACHE_STORE=redis"
echo "2. Clear Laravel cache: php artisan cache:clear"
echo "3. Clear config cache: php artisan config:clear"
echo "4. Test the draft endpoints"
echo ""
echo "Redis is now running on: 127.0.0.1:6379"
echo "=========================================="
