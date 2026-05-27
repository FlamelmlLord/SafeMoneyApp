# Guía de Deployment en Hostinger

Este documento explica cómo desplegar la aplicación Ingeniería Económica en Hostinger.

## Requisitos en Hostinger

- PHP 8.2 o superior
- Extensiones: `bcmath`, `json`, `mbstring`
- Acceso a Composer (recomendado) o capacidad de subir `vendor/`
- Apache con módulo `mod_rewrite` habilitado

## Paso 1: Preparación del Proyecto

### 1.1 Compilar el Frontend

En tu máquina local, compila el frontend React:

```bash
cd frontend
npm install
npm run build
```

Esto generará una carpeta `frontend/dist/` con los archivos estáticos compilados.

### 1.2 Copiar archivos compilados

Copia el contenido de `frontend/dist/` a `backend/public/dist/`:

```bash
# Desde la raíz del proyecto
cp -r frontend/dist/* backend/public/dist/
```

## Paso 2: Configuración del Backend

### 2.1 Composer (Recomendado)

Si Hostinger permite acceso a Composer via terminal:

```bash
cd backend
composer install --no-dev --optimize-autoloader
```

### 2.2 Sin Composer (Alternativa)

Si no tienes acceso a Composer, sube manualmente la carpeta `backend/vendor/` completa.

## Paso 3: Estructura en Hostinger

La estructura debe ser así en el servidor:

```
public_html/
├── .htaccess (reescritura de URLs)
├── backend/
│   ├── .htaccess
│   ├── composer.json
│   ├── vendor/
│   ├── src/
│   ├── tests/
│   └── public/
│       ├── .htaccess
│       ├── index.php (entrada de la API)
│       └── dist/
│           ├── index.html (frontend compilado)
│           ├── assets/
│           └── ...
└── ...
```

## Paso 4: Subida a Hostinger

### Opción A: Usando el Administrador de Archivos

1. Conéctate al panel de Hostinger
2. Abre el Administrador de Archivos
3. Navega a `public_html/`
4. Sube toda la carpeta `backend/` (incluyendo `vendor/`)
5. Sube los archivos `.htaccess` en la raíz y en las subcarpetas

### Opción B: Usando FTP

1. Usa FileZilla o cliente FTP similar
2. Conecta con tus credenciales FTP de Hostinger
3. Navega a `public_html/`
4. Sube `backend/` completo
5. Sube los `.htaccess`

### Opción C: Usando Git (Recomendado)

Si Hostinger lo permite:

```bash
# En el servidor
cd public_html
git clone https://github.com/tuusuario/SafeMoneyApp.git
cd SafeMoneyApp
cd backend
composer install --no-dev --optimize-autoloader
```

## Paso 5: Configuración en Hostinger

### 5.1 Habilitar mod_rewrite

- En el panel de Hostinger, ve a **Configuración > Apache**
- Asegúrate de que `mod_rewrite` está habilitado
- Reinicia Apache si es necesario

### 5.2 Permisos de archivos

```bash
chmod 755 backend/public
chmod 644 backend/public/index.php
chmod 644 .htaccess
chmod 644 backend/.htaccess
chmod 644 backend/public/.htaccess
```

### 5.3 Variables de entorno (opcional)

Si necesitas variables de entorno, crea `backend/.env`:

```env
APP_ENV=production
APP_DEBUG=false
PHP_VERSION=8.2
```

## Paso 6: Verificar la Instalación

1. Abre `https://tudominio.com/api/v1/health`
   - Deberías ver: `{"status":"ok","phpVersion":"8.2.x"}`

2. Abre `https://tudominio.com/api/v1/modulos`
   - Deberías ver la lista de módulos disponibles

3. Abre `https://tudominio.com/`
   - Deberías ver la aplicación React funcionando

## Problemas Comunes

### Error 404 en rutas `/api/v1/*`

**Solución**: Asegúrate de que:
- `.htaccess` está presente en `public_html/`
- `mod_rewrite` está habilitado
- Reinicia Apache o espera a que la configuración se cargue

### Error de permiso en `composer.json`

**Solución**: 
- Sube `vendor/` manualmente si `composer` no está disponible
- O usa SSH para ejecutar `composer install`

### Problema con CORS

**Solución**: El CORS está configurado en `backend/public/index.php` para aceptar cualquier origen. Si necesitas restringir:

```php
'Access-Control-Allow-Origin' => 'https://tudominio.com'
```

### Problema con caracteres especiales en JSON

**Solución**: Verifica que PHP tenga `php_json` habilitado en tu hosting.

## Mantenimiento

### Actualizar la aplicación

```bash
cd public_html/backend
git pull origin main
composer install --no-dev --optimize-autoloader
```

### Ver logs de error

- En Hostinger, usa el visor de logs de PHP en el panel
- Busca en `/home/usuario/logs/` o similar según tu hosting

## SSL/HTTPS

Los `.htaccess` ya están configurados para forzar HTTPS. Hostinger proporciona SSL gratis con Let's Encrypt.

## Soporte

Si encuentras problemas:

1. Verifica la versión de PHP: `https://tudominio.com/api/v1/health`
2. Revisa los logs de Apache: panel de Hostinger > Logs > Error
3. Verifica permisos de archivos: deben ser 755 (carpetas) y 644 (archivos)
4. Confirma que `mod_rewrite` está habilitado

---

**Última actualización**: 2026-05-27
**Stack**: PHP 8.2 | Slim 4 | React 18 | TypeScript | Vite
