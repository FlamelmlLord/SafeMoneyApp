#!/bin/bash

# Post-Installation Setup Script
# Ejecutar después de desplegar en Hostinger para verificar y finalizar la instalación

set -e

echo "═══════════════════════════════════════════════════════════"
echo "  SafeMoneyApp - Post-Installation Setup"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar PHP
echo "Checking PHP installation..."
if command -v php &> /dev/null; then
    PHP_VERSION=$(php -v | head -n 1 | grep -oP 'PHP \K[0-9.]+' | cut -d. -f1-2)
    if [ "$PHP_VERSION" \> "8.1" ] || [ "$PHP_VERSION" = "8.2" ]; then
        echo -e "${GREEN}✓${NC} PHP $PHP_VERSION found (required: 8.2+)"
    else
        echo -e "${RED}✗${NC} PHP $PHP_VERSION found (required: 8.2+)"
        exit 1
    fi
else
    echo -e "${RED}✗${NC} PHP not found"
    exit 1
fi

echo ""

# 2. Verificar extensiones
echo "Checking PHP extensions..."

extensions=("bcmath" "json" "mbstring" "openssl" "curl")
for ext in "${extensions[@]}"; do
    if php -m | grep -q "^$ext\$"; then
        echo -e "${GREEN}✓${NC} Extension $ext enabled"
    else
        echo -e "${YELLOW}⚠${NC} Extension $ext not found"
    fi
done

echo ""

# 3. Verificar composer
echo "Checking Composer installation..."
if [ -f "backend/vendor/autoload.php" ]; then
    echo -e "${GREEN}✓${NC} Composer dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Composer dependencies not found"
    
    if command -v composer &> /dev/null; then
        echo "Installing dependencies with Composer..."
        cd backend
        composer install --no-dev --optimize-autoloader
        cd ..
    fi
fi

echo ""

# 4. Verificar frontend
echo "Checking frontend compilation..."
if [ -f "backend/public/dist/index.html" ]; then
    echo -e "${GREEN}✓${NC} Frontend compiled successfully"
else
    echo -e "${YELLOW}⚠${NC} Frontend not compiled"
    echo "Compiling frontend..."
    
    if command -v npm &> /dev/null; then
        cd frontend
        npm install --production
        npm run build
        cd ..
    else
        echo -e "${RED}✗${NC} npm not found, cannot compile frontend"
    fi
fi

echo ""

# 5. Verificar permisos
echo "Setting permissions..."
chmod -R 755 backend/public
chmod -R 755 backend/public/dist 2>/dev/null || true
chmod 644 .htaccess backend/.htaccess backend/public/.htaccess 2>/dev/null || true
echo -e "${GREEN}✓${NC} Permissions set"

echo ""

# 6. Crear .env si no existe
echo "Checking environment configuration..."
if [ ! -f "backend/.env" ] && [ -f "backend/.env.example" ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓${NC} Created backend/.env from .env.example"
    echo -e "${YELLOW}⚠${NC} Edit backend/.env with your production settings"
else
    echo -e "${GREEN}✓${NC} Environment configuration found"
fi

echo ""

# 7. Verificar API
echo "Testing API endpoints..."

if [ -n "$DOMAIN" ] || [ -n "$1" ]; then
    DOMAIN="${1:-$DOMAIN}"
    PROTOCOL="${2:-https}"
    
    echo "Testing: $PROTOCOL://$DOMAIN/api/v1/health"
    
    if curl -s "$PROTOCOL://$DOMAIN/api/v1/health" | grep -q "ok"; then
        echo -e "${GREEN}✓${NC} Health check passed"
    else
        echo -e "${YELLOW}⚠${NC} Health check failed"
    fi
    
    echo "Testing: $PROTOCOL://$DOMAIN/"
    if curl -s "$PROTOCOL://$DOMAIN/" | grep -q "html"; then
        echo -e "${GREEN}✓${NC} Frontend accessible"
    else
        echo -e "${YELLOW}⚠${NC} Frontend not accessible"
    fi
else
    echo -e "${YELLOW}⚠${NC} Skipping API tests (run: bash post-install.sh yourdomain.com)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  Post-installation completed"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Recommended next steps:"
echo "1. Edit backend/.env with production settings"
echo "2. Test API: curl https://yourdomain.com/api/v1/health"
echo "3. Visit: https://yourdomain.com/"
echo "4. Review: DEPLOY_HOSTINGER.md for troubleshooting"
echo ""
