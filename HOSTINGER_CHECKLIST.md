# Checklist de Deployment en Hostinger

Use este checklist para asegurar que todo está correctamente configurado en Hostinger.

## ✅ Pre-Deployment (Local)

- [ ] Rama Cristian está actualizada y commiteada
- [ ] Frontend compilado: `npm run build` en `/frontend`
- [ ] Backend sin errores de sintaxis: `php -l backend/public/index.php`
- [ ] Tests pasan: `composer test` en `/backend`
- [ ] `.env.example` presente en `backend/`
- [ ] Los 3 `.htaccess` están creados (raíz, backend, backend/public)

## ✅ Setup en Hostinger

### 1. Requisitos del Servidor

- [ ] PHP 8.2+ (verificar en panel de control)
- [ ] Extensión `bcmath` habilitada
- [ ] Extensión `json` habilitada  
- [ ] `mod_rewrite` habilitado en Apache
- [ ] Acceso SSH o Terminal (para composer)

### 2. Estructura de Carpetas

- [ ] Carpeta `public_html/backend/` existe
- [ ] Carpeta `public_html/backend/public/` existe
- [ ] Carpeta `public_html/backend/src/` existe
- [ ] Carpeta `public_html/backend/vendor/` existe (si se subió)
- [ ] Carpeta `public_html/backend/public/dist/` existe

### 3. Archivos de Configuración

- [ ] `.htaccess` en `public_html/`
- [ ] `.htaccess` en `public_html/backend/`
- [ ] `.htaccess` en `public_html/backend/public/`
- [ ] `backend/composer.json` presente
- [ ] `backend/public/index.php` presente

### 4. Instalación de Dependencias

**Opción A: Con Composer (Recomendado)**
```bash
cd public_html/backend
composer install --no-dev --optimize-autoloader
```

- [ ] Comando ejecutado sin errores
- [ ] `vendor/` creada
- [ ] `vendor/autoload.php` existe

**Opción B: Sin Composer**
- [ ] Carpeta `vendor/` subida completa
- [ ] `vendor/autoload.php` presente
- [ ] `vendor/composer/autoload_real.php` presente

### 5. Frontend Compilado

- [ ] `backend/public/dist/` contiene archivos
- [ ] `backend/public/dist/index.html` existe
- [ ] `backend/public/dist/assets/` existe
- [ ] Permisos correctos: `chmod 755 backend/public/dist`

## ✅ Testing Post-Deploy

### 1. Healthcheck de la API

```bash
curl https://tudominio.com/api/v1/health
```

**Esperado:**
```json
{"ok":true,"data":{"status":"ok","phpVersion":"8.2.x"}}
```

- [ ] Responde 200
- [ ] Muestra versión de PHP correcta
- [ ] No hay errores de 404

### 2. Catálogo de Módulos

```bash
curl https://tudominio.com/api/v1/modulos
```

**Esperado:**
- [ ] Devuelve array de 17 módulos
- [ ] Cada módulo tiene id, nombre, categoría
- [ ] Respuesta JSON válida

### 3. Frontend Accesible

```bash
curl https://tudominio.com/
```

**Esperado:**
- [ ] Devuelve HTML de React
- [ ] Código de estado 200
- [ ] Contiene `<!DOCTYPE html>`

### 4. Test de un Cálculo

```bash
curl -X POST https://tudominio.com/api/v1/interes-simple/calcular \
  -H "Content-Type: application/json" \
  -d '{
    "P": "1000",
    "i": "0.10",
    "n": "5",
    "calcular": "F"
  }'
```

**Esperado:**
- [ ] Devuelve resultado correcto: `1500.00`
- [ ] Estructura: `{"ok":true,"data":{...}}`
- [ ] Sin errores de cálculo

### 5. CORS Funcionando

Prueba desde el navegador (dev console):
```javascript
fetch('https://tudominio.com/api/v1/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

- [ ] No hay error de CORS
- [ ] Respuesta correcta
- [ ] Headers CORS presentes

## ✅ Seguridad

- [ ] HTTPS forzado (`.htaccess` con RewriteCond)
- [ ] `www.` redirige correctamente (o sin `www.` según tu preferencia)
- [ ] `DEBUG` está en false en `.env`
- [ ] `APP_ENV` está en `production`
- [ ] `ALLOWED_ORIGIN` restringido a tu dominio

## ✅ Performance

- [ ] Caché de archivos estáticos habilitada (`.htaccess`)
- [ ] Gzip comprimiendo respuestas (verificar en dev tools)
- [ ] Assets (JS, CSS) minificados en `dist/`
- [ ] Tiempo de respuesta `/api/v1/health` < 200ms

## ✅ Logs y Debugging

- [ ] Acceso a logs de PHP en panel Hostinger
- [ ] Acceso a logs de Apache (si disponible)
- [ ] No hay errores de parse en `index.php`
- [ ] No hay warnings de include/require

## ✅ Backup y Recuperación

- [ ] Backup del proyecto local guardado
- [ ] Git remote configurado
- [ ] Rama `Cristian` pusheada a GitHub/GitLab
- [ ] Documentación guardada (este checklist)

## ⚠️ Problemas Comunes

| Problema | Solución |
|----------|----------|
| 404 en `/api/*` | Verificar `.htaccess` y `mod_rewrite` |
| Error BCMath | Habilitar extensión en panel |
| Frontend en blanco | Verificar `backend/public/dist/` existe |
| CORS error | Revisar `ALLOWED_ORIGIN` en `.env` |
| Permisos denegados | `chmod 755` en carpetas `backend/public/*` |
| Composer timeout | Usar `--no-dev` y `--optimize-autoloader` |

## 📞 Checklist de Soporte Hostinger

Si algo no funciona, tener a mano:

- [ ] Ticket de soporte con mensaje de error exacto
- [ ] Versión de PHP (de `/api/v1/health`)
- [ ] Salida de `php -i | grep bcmath` (si tienes SSH)
- [ ] Contenido de error log (`public_html/error_log`)
- [ ] URL exacta donde falla
- [ ] Método HTTP y body si es POST

---

**Última actualización:** 2026-05-27  
**Para:** Rama Cristian - Hostinger Ready
