#!/bin/bash

# Script de setup inicial del proyecto
# Uso: bash setup.sh

set -e

echo "═══════════════════════════════════════════════════════════"
echo "  SafeMoneyApp - Script de Setup Inicial"
echo "═══════════════════════════════════════════════════════════"
echo ""

# 1. Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd backend
if command -v composer &> /dev/null; then
    composer install --optimize-autoloader
else
    echo "⚠️  Composer no encontrado. Asegúrate de subir la carpeta vendor/ manualmente."
fi
cd ..

# 2. Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
cd frontend
npm install
cd ..

# 3. Compilar frontend
echo "🔨 Compilando frontend..."
cd frontend
npm run build
cd ..

# 4. Crear estructura de carpetas necesarias
echo "📁 Creando estructura de carpetas..."
mkdir -p backend/public/dist
mkdir -p backend/public/logs
mkdir -p docs/deployment

# 5. Permisos de archivos
echo "🔐 Configurando permisos de archivos..."
chmod 755 backend/public
chmod 755 backend/public/dist
chmod 644 backend/public/index.php
chmod 644 .htaccess
chmod 644 backend/.htaccess
chmod 644 backend/public/.htaccess

# 6. Verificar instalación
echo ""
echo "✅ Verificación de instalación:"
echo ""

if [ -f "backend/vendor/autoload.php" ]; then
    echo "✓ Autoloader de Composer presente"
else
    echo "✗ Autoloader de Composer no encontrado"
fi

if [ -d "backend/public/dist" ] && [ "$(ls -A backend/public/dist)" ]; then
    echo "✓ Frontend compilado en backend/public/dist/"
else
    echo "✗ Frontend no compilado"
fi

if [ -f ".htaccess" ] && [ -f "backend/.htaccess" ] && [ -f "backend/public/.htaccess" ]; then
    echo "✓ Archivos .htaccess presentes"
else
    echo "✗ Falta algún archivo .htaccess"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ✅ Setup completado exitosamente"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Próximos pasos:"
echo "1. Abre: http://localhost/api/v1/health"
echo "2. Abre: http://localhost/"
echo "3. Lee: DEPLOY_HOSTINGER.md para desplegar en producción"
echo ""
