# 🏗️ ARQUITECTURA DE DEPLOYMENT - Hostinger

## 🔄 Flujo de Funcionamiento

### Arquitectura Original (Desarrollo Local)

```
┌─────────────────────────────────────────────────────────────┐
│                    Tu Computadora                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Terminal 1: php -S localhost:8000 -t backend/public         │
│  ┌──────────────────────────────┐                            │
│  │  Backend (Slim 4)            │                            │
│  │  Port: 8000                  │                            │
│  │  - /api/v1/health           │ ←── Browser (localhost)
│  │  - /api/v1/modulos          │ ←── Browser (localhost)
│  │  - /api/v1/calcular/*       │                            │
│  └──────────────────────────────┘                            │
│           ▲                                                    │
│           │ API Calls (CORS)                                 │
│           │                                                    │
│  ┌──────────────────────────────┐                            │
│  │  Frontend (React + Vite)     │                            │
│  │  Port: 5173                  │                            │
│  │  npm run dev                 │ ←── Browser (localhost:5173)
│  │  ├─ TypeScript Compilation   │                            │
│  │  ├─ Hot Module Reload        │                            │
│  │  └─ Proxy /api → localhost:8000                           │
│  └──────────────────────────────┘                            │
│                                                               │
│  Terminal 2: npm run dev (en frontend/)                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

### Arquitectura Nueva (Hostinger)

```
┌─────────────────────────────────────────────────────────────┐
│                    Hostinger (VPS/Shared)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  public_html/                                                 │
│  ├── .htaccess                                               │
│  │   └─ Reescribe URLs a backend/public/index.php           │
│  │                                                            │
│  └── backend/                                                │
│      ├── .htaccess                                           │
│      ├── public/                                             │
│      │   ├── .htaccess                                       │
│      │   ├── index.php (Slim Framework)                      │
│      │   │   ├─ Sirve /api/v1/* (API)                       │
│      │   │   └─ Sirve / (Frontend compilado)                │
│      │   ├── dist/  ← Frontend Compilado                    │
│      │   │   ├─ index.html                                  │
│      │   │   ├─ assets/                                     │
│      │   │   │   ├─ main.js (minificado)                    │
│      │   │   │   ├─ main.css (minificado)                   │
│      │   │   │   └─ ...otros chunks                         │
│      │   │   └─ favicon.ico                                 │
│      │   └── logs/                                          │
│      ├── src/                                                │
│      │   ├── Finance/                                        │
│      │   └── Http/                                           │
│      ├── vendor/                                             │
│      ├── composer.json                                       │
│      └── .env                                                │
│                                                               │
│  https://tudominio.com/                                      │
│  ├─ GET  / → Sirve dist/index.html                          │
│  ├─ GET  /assets/* → Ficheros estáticos (caché 1 año)       │
│  └─ POST /api/v1/* → Controladores Slim                     │
│                                                               │
│  Apache (mod_rewrite + HTTPS)                                │
│  ├─ Reescribe URLs internas                                 │
│  ├─ Fuerza HTTPS                                            │
│  ├─ Comprime Gzip                                           │
│  └─ Cachea assets estáticos                                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 Flujo de Requests

### Request: GET https://tudominio.com/

```
1. Usuario abre https://tudominio.com/
   ↓
2. Apache recibe request
   ↓
3. .htaccess (raíz) reescribe a: /backend/public/index.php
   ↓
4. Apache recibe request a /backend/public/index.php
   ↓
5. .htaccess (backend/public/) - SIN reescritura (es la meta)
   ↓
6. PHP ejecuta index.php
   ├─ Slim reconoce ruta "/"
   ├─ Controlador GET "/"
   │  └─ Verifica si existe backend/public/dist/index.html
   │     ├─ Sí: Sirve HTML + Navegador carga JS/CSS
   │     └─ No: Responde con info de API (fallback)
   │
7. Navegador carga dist/index.html
   ├─ Descarga main.js (minificado)
   ├─ Descarga main.css (minificado)
   └─ React monta aplicación
   
8. React en navegador está listo
   └─ Usuario ve interfaz con 17 módulos
```

---

### Request: POST https://tudominio.com/api/v1/interes-simple/calcular

```
1. Usuario hace cálculo en la app React
   ├─ Input: P=1000, i=0.10, n=5
   └─ React hace fetch POST a /api/v1/interes-simple/calcular
   ↓
2. Apache recibe request POST
   ↓
3. .htaccess (raíz) reescribe a: /backend/public/index.php?...
   ↓
4. Apache recibe request a /backend/public/index.php
   ↓
5. .htaccess (backend/public/) no interfiere
   ↓
6. PHP ejecuta index.php
   ├─ Slim parsea body JSON
   ├─ Reconoce ruta POST /api/v1/interes-simple/calcular
   └─ Ejecuta controlador
   
7. Controlador procesa:
   ├─ Valida inputs (Validators.php)
   ├─ Crea objeto Money (BCMath, 30 dígitos)
   ├─ Calcula interés simple: F = P(1 + i*n)
   ├─ Genera pasos del cálculo
   └─ Retorna JSON: {"ok":true,"data":{...}}
   
8. Apache comprime Gzip (header Accept-Encoding)
   
9. Navegador recibe JSON comprimido
   └─ React actualiza UI con resultados
```

---

## 📦 Estructura de Carpetas en Hostinger

```
/home/usuario/
└── public_html/                              ← "Document Root"
    ├── .htaccess                             ← Apache: reescribe URLs
    │   ```
    │   RewriteEngine On
    │   RewriteCond %{REQUEST_FILENAME} !-f
    │   RewriteCond %{REQUEST_FILENAME} !-d
    │   RewriteRule ^(.*)$ backend/public/index.php [QSA,L]
    │   ```
    │
    ├── backend/
    │   ├── .htaccess                         ← Apache: reescribe URLs
    │   │   ```
    │   │   RewriteEngine On
    │   │   RewriteCond %{REQUEST_FILENAME} !-f
    │   │   RewriteCond %{REQUEST_FILENAME} !-d
    │   │   RewriteRule ^(.*)$ public/index.php [QSA,L]
    │   │   ```
    │   │
    │   ├── public/
    │   │   ├── .htaccess                     ← Apache: caché + headers
    │   │   │   ```
    │   │   │   <IfModule mod_rewrite.c>
    │   │   │       RewriteEngine On
    │   │   │       RewriteCond %{REQUEST_FILENAME} !-f
    │   │   │       RewriteCond %{REQUEST_FILENAME} !-d
    │   │   │       RewriteRule ^(.*)$ index.php [QSA,L]
    │   │   │   </IfModule>
    │   │   │   ```
    │   │   │
    │   │   ├── index.php                     ← APP ENTRY POINT
    │   │   │   (Slim Framework + Rutas API + Servir Frontend)
    │   │   │
    │   │   ├── dist/                         ← FRONTEND COMPILADO
    │   │   │   ├── index.html
    │   │   │   ├── assets/
    │   │   │   │   ├── main.HASH.js
    │   │   │   │   ├── main.HASH.css
    │   │   │   │   ├── vendor.HASH.js
    │   │   │   │   └── ...
    │   │   │   └── favicon.ico
    │   │   │
    │   │   └── logs/
    │   │       └── php-errors.log (si existe)
    │   │
    │   ├── src/
    │   │   ├── Finance/                      ← LÓGICA MATEMÁTICA
    │   │   │   ├── Money.php (BCMath)
    │   │   │   ├── Rate.php
    │   │   │   ├── SimpleInterest.php
    │   │   │   ├── CompoundInterest.php
    │   │   │   ├── Annuity.php
    │   │   │   ├── Amortization.php
    │   │   │   └── ...
    │   │   │
    │   │   └── Http/
    │   │       ├── Errors.php (respuestas)
    │   │       └── Validators.php (validación)
    │   │
    │   ├── tests/
    │   │   └── Finance/
    │   │       └── *Test.php (43 tests)
    │   │
    │   ├── vendor/                           ← DEPENDENCIES (Composer)
    │   │   ├── autoload.php
    │   │   ├── slim/slim/
    │   │   ├── slim/psr7/
    │   │   ├── php-di/php-di/
    │   │   └── ...
    │   │
    │   ├── composer.json
    │   ├── composer.lock
    │   ├── .env                              ← CONFIG (creada durante setup)
    │   │   ```env
    │   │   APP_ENV=production
    │   │   APP_DEBUG=false
    │   │   ALLOWED_ORIGIN=https://tudominio.com
    │   │   ```
    │   │
    │   └── .env.example
    │
    └── error_log                             ← LOG de errores Apache
```

---

## 🔐 Flujo de Seguridad

```
┌──────────────────────────────────────────────────────────┐
│  Browser hace request a https://tudominio.com/api/v1/*   │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│  Apache (mod_rewrite)                                    │
│  ├─ Verifica HTTPS (RewriteCond %{HTTPS})               │
│  │  └─ Si HTTP: Redirige a HTTPS (R=301)                │
│  ├─ Verifica archivo real (RewriteCond !-f)             │
│  └─ Reescribe a backend/public/index.php                │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│  PHP/Slim (index.php)                                    │
│  ├─ Middleware CORS                                     │
│  │  └─ Verifica ALLOWED_ORIGIN en .env                  │
│  │     ├─ Prod: Solo tudominio.com                      │
│  │     └─ Dev: * (todos los orígenes)                   │
│  ├─ Parsea JSON body                                    │
│  ├─ Valida inputs (Validators.php)                      │
│  └─ Ejecuta lógica (Finance/*.php)                      │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│  Respuesta                                               │
│  ├─ JSON: {"ok":true,"data":{...}} o error              │
│  ├─ Headers: Access-Control-Allow-Origin                │
│  ├─ Status: 200, 400, 404, 500 (según resultado)        │
│  └─ Comprimida: Gzip (si soportado)                     │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│  Browser recibe y procesa                                │
│  └─ React actualiza UI                                  │
└──────────────────────────────────────────────────────────┘
```

---

## 📊 Diagrama de Despliegue

```
┌──────────────────────────────┐
│    Tu Computadora (Local)    │
├──────────────────────────────┤
│  ├─ backend/                 │
│  ├─ frontend/                │
│  └─ .git (repo)              │
└──────────────────────────────┘
             │ git push
             │ o zip/ftp
             ↓
┌──────────────────────────────┐
│  Hostinger (Servidor Web)    │
├──────────────────────────────┤
│  public_html/                │
│  ├─ .htaccess                │ ← Apache Config
│  ├─ backend/                 │ ← PHP Code
│  │  ├─ public/               │ ← Entry Point
│  │  │  ├─ index.php          │ ← APP
│  │  │  └─ dist/              │ ← React Build
│  │  ├─ vendor/               │ ← Composer
│  │  └─ src/                  │ ← Logic
│  └─ (otros archivos)         │
│                              │
│  Apache:                     │ ← Reescribe URLs
│  ├─ mod_rewrite              │ ← Fuerza HTTPS
│  ├─ mod_gzip                 │ ← Comprime
│  └─ mod_expires              │ ← Caché
│                              │
│  PHP 8.2:                    │ ← Ejecuta código
│  ├─ ext-bcmath               │ ← Precisión
│  └─ ext-json                 │ ← API
└──────────────────────────────┘
             │
             │ https://tudominio.com
             ↓
┌──────────────────────────────┐
│    Usuario (Navegador)       │
├──────────────────────────────┤
│  ├─ GET /                    │ ← React HTML
│  ├─ GET /assets/main.js      │ ← JS Bundle
│  ├─ GET /assets/main.css     │ ← CSS Bundle
│  └─ POST /api/v1/calcular/*  │ ← API Calls
└──────────────────────────────┘
```

---

## 🔄 Ciclo de Vida de un Cálculo

```
Usuario escribe valores en formulario
       ↓
React valida inputs en frontend
       ↓
React hace fetch POST a /api/v1/modulo/calcular
       ↓
JSON enviado: {"P":"1000","i":"0.10","n":"5","calcular":"F"}
       ↓
Apache intercepta, .htaccess reescribe URLs
       ↓
PHP/Slim recibe request en index.php
       ↓
Middleware CORS verifica origen
       ↓
Slim routing encuentra ruta coincidente
       ↓
Controlador extrae body JSON
       ↓
Validators.php valida cada parámetro
       ↓
SimpleInterest.php o módulo correspondiente:
   ├─ Crea Money object (BCMath, 30 decimales)
   ├─ Calcula: F = P * (1 + i * n)
   ├─ Almacena pasos intermedios
   └─ Redondea a 2 decimales para mostrar
       ↓
Errors.php arma respuesta JSON:
   {
     "ok": true,
     "data": {
       "resultado": "1500.00",
       "pasos": [...]
     }
   }
       ↓
Apache comprime Gzip
       ↓
HTTPS encripta y envía al navegador
       ↓
React recibe JSON
       ↓
React actualiza state con resultado
       ↓
Componentes se re-renderizan
       ↓
Usuario ve resultado y gráfica actualizada
       ↓
Usuario puede exportar como JSON
       ↓
Usuario puede cambiar valores y recalcular (loop)
```

---

## 💾 Datos y Estado

```
┌─────────────────────────────┐
│  NO HAY BASE DE DATOS       │
├─────────────────────────────┤
│  Todo está en memoria       │
│  durante la sesión          │
└─────────────────────────────┘

Opciones de persistencia:
├─ Export JSON: Usuario descarga JSON con cálculo
├─ localStorage: Navegador guarda preferencia 360/365
└─ Futuro: Si quieres, agregar base de datos

Implicaciones:
├─ Ventaja: No hay overhead de DB
├─ Ventaja: Escalable (sin cuello de botella)
├─ Desventaja: No hay historial de cálculos
└─ Desventaja: Datos se pierden al recargar (por design)
```

---

## 🎯 Resumen de Flujo

| Acción | Componente | Detalle |
|--------|-----------|---------|
| **1. Usuario abre URL** | Browser | `https://tudominio.com` |
| **2. Apache intercepta** | Servidor | RewriteRule reescribe URLs |
| **3. PHP carga** | Backend | `index.php` de Slim ejecuta |
| **4. React se carga** | Frontend | `dist/index.html` + `main.js` |
| **5. Usuario ingresa datos** | React | Form validation en cliente |
| **6. Usuario calcula** | React | `fetch POST /api/v1/...` |
| **7. Backend procesa** | PHP | Slim routing + Finance class |
| **8. Respuesta JSON** | PHP | `{"ok":true,"data":{...}}` |
| **9. React actualiza** | React | State change → re-render |
| **10. Usuario ve resultado** | Browser | Gráfica, tabla, pasos |
| **11. Usuario exporta** | React | JSON descargado |

---

**Este flujo es:**
- ✅ Seguro (HTTPS, CORS, validación)
- ✅ Eficiente (sin DB, BCMath preciso)
- ✅ Escalable (arquitectura sin estado)
- ✅ Mantenible (código separado: backend/frontend)
- ✅ Desplegable en Hostinger (PHP estándar)

---

**Última actualización:** 2026-05-27  
**Para entender:** Cómo funciona la app en Hostinger
