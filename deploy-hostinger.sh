#!/bin/bash

# Script de deployment para Hostinger
# Ejecutar en el servidor remoto después de clonar el repositorio
# Uso: bash deploy-hostinger.sh

set -e

echo "═══════════════════════════════════════════════════════════"
echo "  SafeMoneyApp - Deployment a Hostinger"
echo "═══════════════════════════════════════════════════════════"
echo ""

ENVIRONMENT="${1:-production}"

echo "Entorno: $ENVIRONMENT"
echo ""

# 1. Navegar al directorio correcto
cd "$(dirname "$0")"
PROJECT_ROOT="$(pwd)"

# 2. Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd "$PROJECT_ROOT/backend"

# Comprobar si composer está disponible
if command -v composer &> /dev/null; then
    echo "   Usando Composer local..."
    composer install --no-dev --optimize-autoloader
elif [ -f "/usr/local/bin/composer" ]; then
    echo "   Usando Composer global..."
    /usr/local/bin/composer install --no-dev --optimize-autoloader
else
    echo "   ⚠️  Composer no encontrado"
    echo "   Asegúrate de que vendor/ ya está presente o sube los paquetes manualmente"
fi

cd "$PROJECT_ROOT"

# 3. Compilar frontend si no está compilado
if [ ! -f "backend/public/dist/index.html" ]; then
    echo "🔨 Compilando frontend..."
    
    if ! command -v npm &> /dev/null; then
        echo "   ❌ npm no encontrado. Instala Node.js o compila el frontend localmente"
        exit 1
    fi
    
    cd frontend
    npm install --production
    npm run build
    cd "$PROJECT_ROOT"
fi

# 4. Establecer permisos correctos
echo "🔐 Configurando permisos..."
chmod 755 backend/public
chmod 755 backend/public/dist
chmod 644 backend/public/index.php
chmod 644 .htaccess backend/.htaccess backend/public/.htaccess

# 5. Crear estructura de carpetas
mkdir -p backend/public/logs

# 6. Crear archivo de configuración de entorno
if [ "$ENVIRONMENT" = "production" ]; then
    echo "📝 Creando configuración de producción..."
    
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOF
APP_ENV=production
APP_DEBUG=false
ALLOWED_ORIGIN=${2:-*}
PHP_VERSION=$(php -v | head -n 1 | grep -oP 'PHP \K[0-9.]+')
EOF
        echo "   Archivo .env creado"
    fi
    
    # Forzar HTTPS en el .htaccess raíz
    sed -i 's/# Redirige HTTPS/RewriteCond %{HTTPS} off/' .htaccess 2>/dev/null || true
fi

# 7. Verificación
echo ""
echo "✅ Verificación de instalación:"
echo ""

PHP_VERSION=$(php -v | head -n 1 | grep -oP 'PHP \K[0-9]+\.[0-9]+' | head -c 3)
if [ -n "$PHP_VERSION" ]; then
    if [ "$PHP_VERSION" \> "8.1" ] || [ "$PHP_VERSION" = "8.2" ]; then
        echo "✓ PHP $PHP_VERSION (requerido: 8.2+)"
    else
        echo "✗ PHP $PHP_VERSION (se requiere 8.2 o superior)"
    fi
fi

if [ -f "backend/vendor/autoload.php" ]; then
    echo "✓ Dependencias de PHP instaladas"
else
    echo "✗ Dependencias de PHP no encontradas"
fi

if [ -f "backend/public/dist/index.html" ]; then
    echo "✓ Frontend compilado"
else
    echo "✗ Frontend no compilado"
fi

if [ -f ".htaccess" ]; then
    echo "✓ Configuración Apache (.htaccess) presente"
else
    echo "✗ Falta configuración Apache"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ✅ Deployment completado"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Próximos pasos:"
echo "1. Verifica: https://tudominio.com/api/v1/health"
echo "2. Abre: https://tudominio.com/"
echo "3. Revisa logs si hay problemas"
echo ""
