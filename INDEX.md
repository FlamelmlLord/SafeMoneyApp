# 📚 ÍNDICE DE DOCUMENTACIÓN - SafeMoneyApp Cristian

**Rama:** Cristian (Adaptada para Hostinger)  
**Última actualización:** 2026-05-27  
**Estado:** ✅ Listo para producción

---

## 🚀 INICIO RÁPIDO (5 minutos)

### Para setup local automático:
- **Windows:** [setup.bat](setup.bat) - Instala todo con un click
- **Linux/Mac:** [setup.sh](setup.sh) - Instala todo automáticamente

### Para empezar rápido:
- 📖 [**QUICKSTART.md**](QUICKSTART.md) ← **LEER PRIMERO**
  - 5 minutos: Setup local
  - 5 pasos: Deploy en Hostinger
  - Tabla de comandos clave
  - Troubleshooting rápido

---

## 📖 DOCUMENTACIÓN POR TEMA

### 🌐 DEPLOYMENT EN HOSTINGER

| Documento | Propósito | Tiempo |
|-----------|-----------|--------|
| [**DEPLOY_HOSTINGER.md**](DEPLOY_HOSTINGER.md) | Guía completa paso a paso | 15 min |
| [**HOSTINGER_CHECKLIST.md**](HOSTINGER_CHECKLIST.md) | Checklist de deployment | 10 min |
| [ARQUITECTURA_HOSTINGER.md](ARQUITECTURA_HOSTINGER.md) | Cómo funciona internamente | 10 min |

**Flujo recomendado:**
1. Leer [QUICKSTART.md](QUICKSTART.md)
2. Ejecutar [setup.bat](setup.bat) o [setup.sh](setup.sh)
3. Leer [DEPLOY_HOSTINGER.md](DEPLOY_HOSTINGER.md)
4. Usar [HOSTINGER_CHECKLIST.md](HOSTINGER_CHECKLIST.md) durante deployment
5. Usar [post-install.sh](post-install.sh) después de subir

---

### 🏗️ ARQUITECTURA Y DISEÑO

| Documento | Contenido | Público |
|-----------|-----------|---------|
| [ARQUITECTURA_HOSTINGER.md](ARQUITECTURA_HOSTINGER.md) | Diagramas ASCII, flujos, estructura | ✅ Sí |
| [RESUMEN_CAMBIOS.md](RESUMEN_CAMBIOS.md) | Antes/después, archivos nuevos | ✅ Sí |
| [README.md](README.md) | Stack técnico, features, referencias | ✅ Sí |
| [docs/arquitectura.md](docs/arquitectura.md) | Arquitectura original del proyecto | ✅ Sí |

---

### 🛠️ SCRIPTS Y AUTOMATIZACIÓN

| Script | Plataforma | Propósito |
|--------|-----------|----------|
| [setup.bat](setup.bat) | Windows | Setup automático local |
| [setup.sh](setup.sh) | Linux/Mac | Setup automático local |
| [deploy-hostinger.sh](deploy-hostinger.sh) | Linux/Mac | Deploy en servidor Hostinger |
| [post-install.sh](post-install.sh) | Linux/Mac | Verificación post-instalación |
| [verify-setup.bat](verify-setup.bat) | Windows | Verificar requisitos |

**Cómo usarlos:**
```bash
# Windows
.\setup.bat
.\verify-setup.bat

# Linux/Mac
bash setup.sh
bash deploy-hostinger.sh production
bash post-install.sh tudominio.com https
```

---

### ⚙️ CONFIGURACIÓN

| Archivo | Propósito | Ubicación |
|---------|-----------|-----------|
| `.htaccess` | Reescritura URLs raíz | Raíz del proyecto |
| `backend/.htaccess` | Reescritura URLs backend | `backend/` |
| `backend/public/.htaccess` | Reescritura + caché | `backend/public/` |
| `backend/.env.example` | Configuración recomendada | `backend/` |
| `backend/.env` | Configuración (crear en prod) | `backend/` |
| `frontend/vite.config.build.ts` | Build para Hostinger | `frontend/` |

**Crear `.env` en Hostinger:**
```bash
cp backend/.env.example backend/.env
# Editar backend/.env con:
# APP_ENV=production
# ALLOWED_ORIGIN=https://tudominio.com
```

---

## 📋 GUÍAS PASO A PASO

### 1️⃣ SETUP LOCAL (5 minutos)

**Opción A: Automático (Recomendado)**
```bash
# Windows
.\setup.bat

# Linux/Mac
bash setup.sh
```

**Opción B: Manual**
```bash
# Backend
cd backend
composer install

# Frontend
cd frontend
npm install
npm run build
```

### 2️⃣ DESARROLLO LOCAL

**Terminal 1 (Backend):**
```bash
cd backend
php -S localhost:8000 -t public
# Abre: http://localhost:8000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
# Abre: http://localhost:5173
```

### 3️⃣ COMPILAR PARA PRODUCCIÓN

```bash
cd frontend
npm run build
# Genera: backend/public/dist/
```

### 4️⃣ DEPLOY EN HOSTINGER

**Paso 1:** Compilar
```bash
npm run build
```

**Paso 2:** Subir archivos
- Opción A: Gestor de archivos Hostinger
- Opción B: FTP (FileZilla)
- Opción C: Git + SSH
- Opción D: Descargar ZIP local → subir

**Paso 3:** Instalar dependencias (SSH)
```bash
cd public_html/backend
composer install --no-dev --optimize-autoloader
```

**Paso 4:** Verificar
```
https://tudominio.com/api/v1/health
https://tudominio.com/
```

---

## 🔍 TROUBLESHOOTING

### ❌ Error 404 en `/api/v1/*`
**Causa:** mod_rewrite deshabilitado o `.htaccess` no reconocido

**Soluciones:**
1. Verificar `.htaccess` presentes (3 archivos)
2. Habilitar mod_rewrite en panel Hostinger
3. Verificar permisos: `chmod 644 .htaccess`
4. Reiniciar Apache

### ❌ BCMath not found
**Causa:** Extensión no habilitada en PHP

**Soluciones:**
```bash
# Linux (SSH)
sudo apt-get install php-bcmath

# Windows (XAMPP)
# php.ini: descomentar extension=bcmath

# Hostinger (Panel)
# Habilitar en PHP Settings
```

### ❌ Frontend muestra en blanco
**Causa:** `dist/` no existe o mal ubicado

**Soluciones:**
1. Ejecutar: `npm run build`
2. Verificar: `backend/public/dist/index.html` existe
3. Permisos: `chmod 755 backend/public/dist`

### ❌ CORS error en navegador
**Causa:** `ALLOWED_ORIGIN` mal configurado

**Soluciones:**
```env
# En local: backend/.env
ALLOWED_ORIGIN=*

# En producción: backend/.env
ALLOWED_ORIGIN=https://tudominio.com
```

**Ver más:** [DEPLOY_HOSTINGER.md](DEPLOY_HOSTINGER.md) - Problemas Comunes

---

## 📊 STACK TÉCNICO

```
Backend:
- PHP 8.2+
- Slim Framework 4.12+
- BCMath (precisión 30 decimales)

Frontend:
- React 18+
- TypeScript 5.6+
- Vite 5.4+
- Tailwind 3.4+

Infraestructura:
- Apache 2.4+
- HTTPS (Let's Encrypt)
- mod_rewrite
- Gzip compression
```

**Dependencias detalladas:** [README.md](README.md) - Stack Técnico

---

## 📚 REFERENCIAS RÁPIDAS

### Rutas API
```
GET  /api/v1/health                 ← Healthcheck
GET  /api/v1/modulos                ← Catálogo
POST /api/v1/interes-simple/calcular
POST /api/v1/interes-compuesto/calcular
POST /api/v1/tasas/convertir
POST /api/v1/anualidades/calcular
POST /api/v1/amortizacion/generar
POST /api/v1/ecuaciones-valor/resolver
... y más (ver README.md)
```

### Estructura del Código
```
backend/src/Finance/    ← Lógica matemática con BCMath
backend/src/Http/       ← Validadores y manejadores de error
frontend/src/components/← Componentes React (Calculadoras)
frontend/src/pages/     ← 17 módulos principales
frontend/src/store/     ← Estado (Zustand)
```

### Comandos Útiles
```bash
# Backend
composer test           ← Corre 43 tests PHPUnit
php -l src/**/*.php    ← Valida sintaxis

# Frontend
npm run dev            ← Dev server con hot reload
npm run build          ← Compilar a producción
npm run preview        ← Preview del build

# General
git log --oneline      ← Ver commits
git branch             ← Ver ramas
```

---

## 🎯 FLUJO DE TRABAJO RECOMENDADO

```
1. LECTURA:
   ├─ QUICKSTART.md (5 min)
   ├─ DEPLOY_HOSTINGER.md (15 min)
   └─ ARQUITECTURA_HOSTINGER.md (10 min)

2. SETUP LOCAL:
   └─ Ejecutar setup.bat o setup.sh

3. DESARROLLO:
   ├─ npm run dev (frontend)
   └─ php -S localhost:8000 (backend)

4. ANTES DE SUBIR:
   ├─ npm run build
   ├─ composer test
   └─ git commit -am "descripción"

5. DEPLOYMENT:
   ├─ Seguir DEPLOY_HOSTINGER.md
   ├─ Usar HOSTINGER_CHECKLIST.md
   └─ Ejecutar post-install.sh

6. MANTENIMIENTO:
   ├─ Revisar logs en panel Hostinger
   ├─ Monitorear /api/v1/health
   └─ Hacer backups regulares
```

---

## 📖 LECTURA RECOMENDADA POR PERFIL

### 👨‍💻 Developer (Quiere entender el código)
1. [README.md](README.md) - Stack y features
2. [ARQUITECTURA_HOSTINGER.md](ARQUITECTURA_HOSTINGER.md) - Cómo funciona
3. [docs/arquitectura.md](docs/arquitectura.md) - Arquitectura original
4. Ver código en `backend/src/` y `frontend/src/`

### 🚀 DevOps (Quiere deployar en producción)
1. [QUICKSTART.md](QUICKSTART.md) - 5 minutos
2. [DEPLOY_HOSTINGER.md](DEPLOY_HOSTINGER.md) - Paso a paso
3. [HOSTINGER_CHECKLIST.md](HOSTINGER_CHECKLIST.md) - Checklist
4. [post-install.sh](post-install.sh) - Verificación

### 🎓 Estudiante (Quiere aprender el proyecto)
1. [README.md](README.md) - Visión general
2. [ARQUITECTURA_HOSTINGER.md](ARQUITECTURA_HOSTINGER.md) - Cómo funciona
3. [docs/casos-canonicos.md](docs/casos-canonicos.md) - Casos de prueba
4. Explorar código con IDE

### 🔧 Mantenedor (Quiere mantener en producción)
1. [DEPLOY_HOSTINGER.md](DEPLOY_HOSTINGER.md) - Referencia
2. [HOSTINGER_CHECKLIST.md](HOSTINGER_CHECKLIST.md) - Monitoring
3. Logs de Hostinger (panel)
4. Git commits para auditoría

---

## 🔗 ENLACES ÚTILES

### Documentación
- [QUICKSTART.md](QUICKSTART.md) - Referencia rápida
- [DEPLOY_HOSTINGER.md](DEPLOY_HOSTINGER.md) - Guía completa
- [HOSTINGER_CHECKLIST.md](HOSTINGER_CHECKLIST.md) - Checklist
- [ARQUITECTURA_HOSTINGER.md](ARQUITECTURA_HOSTINGER.md) - Diagramas
- [RESUMEN_CAMBIOS.md](RESUMEN_CAMBIOS.md) - Cambios realizados
- [README.md](README.md) - Proyecto completo

### Código
- [backend/public/index.php](backend/public/index.php) - Entry point
- [backend/src/Finance/](backend/src/Finance/) - Lógica matemática
- [frontend/src/](frontend/src/) - Componentes React

### Configuración
- [.htaccess](.htaccess) - Reescritura de URLs
- [backend/.env.example](backend/.env.example) - Variables de entorno
- [frontend/vite.config.build.ts](frontend/vite.config.build.ts) - Build config

### Scripts
- [setup.bat](setup.bat) - Setup automático (Windows)
- [setup.sh](setup.sh) - Setup automático (Linux/Mac)
- [deploy-hostinger.sh](deploy-hostinger.sh) - Deploy remoto
- [post-install.sh](post-install.sh) - Verificación post-install

---

## ❓ PREGUNTAS FRECUENTES

**P: ¿Necesito base de datos?**
R: No. El proyecto está diseñado sin DB. Si necesitas persistencia, exporta JSON.

**P: ¿Funciona en Hostinger?**
R: Sí. Fue adaptado específicamente. Requiere PHP 8.2+ y ext-bcmath.

**P: ¿Cómo hago deploy?**
R: Sigue [DEPLOY_HOSTINGER.md](DEPLOY_HOSTINGER.md) - es simple con `.htaccess`.

**P: ¿Cómo desarrollo localmente?**
R: `npm run dev` para frontend + `php -S localhost:8000` para backend.

**P: ¿Cuánto tiempo toma desplegar?**
R: 5-15 minutos si tienes Hostinger. Sigue [QUICKSTART.md](QUICKSTART.md).

**P: ¿Dónde están los 17 módulos?**
R: Frontend en `frontend/src/pages/`. Backend en `backend/public/index.php`.

---

## 📞 SOPORTE RÁPIDO

- ✅ Error en setup: Ver [setup.bat](setup.bat) o [setup.sh](setup.sh)
- ✅ Error en deploy: Ver [DEPLOY_HOSTINGER.md](DEPLOY_HOSTINGER.md) - Problemas Comunes
- ✅ Error 404: Ver [HOSTINGER_CHECKLIST.md](HOSTINGER_CHECKLIST.md) - Troubleshooting
- ✅ Error de cálculo: Revisar `backend/tests/Finance/*Test.php`

---

## 🎯 OBJETIVO

**Este proyecto está listo para:**
- ✅ Desarrollo local con npm + php
- ✅ Deploy en Hostinger con un comando
- ✅ Scaling horizontal (sin estado)
- ✅ Mantenimiento simplificado

**Documentación:**
- ✅ Completa y detallada
- ✅ Orientada a Hostinger
- ✅ Con ejemplos prácticos
- ✅ Troubleshooting incluido

---

**Rama:** Cristian  
**Stack:** PHP 8.2 + React 18 + TypeScript + Vite  
**Hosting:** Hostinger  
**Estado:** ✅ Producción Ready  
**Última actualización:** 2026-05-27

---

### 🚀 **COMIENZA POR: [QUICKSTART.md](QUICKSTART.md)**
