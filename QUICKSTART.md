# QUICK START - Guía Rápida

Este documento es una referencia rápida. Para detalles completos, ver [DEPLOY_HOSTINGER.md](DEPLOY_HOSTINGER.md).

## 🎯 5 Minutos: Setup Local

### Windows
```bash
.\setup.bat
```

### Linux/Mac
```bash
bash setup.sh
```

Esto instala dependencias, compila el frontend e integra todo.

## 🚀 5 Pasos: Deploy en Hostinger

### 1. Compilar (Local)
```bash
cd frontend
npm run build
```

### 2. Subir a Hostinger (FTP/SFTP/Git)
```
public_html/
├── backend/         (sube TODO)
├── .htaccess
└── ...
```

### 3. Instalar Dependencias (SSH Terminal)
```bash
cd public_html/backend
composer install --no-dev --optimize-autoloader
```

### 4. Verificar
```bash
# Desde navegador o terminal:
curl https://tudominio.com/api/v1/health
```

### 5. Abrir en Navegador
```
https://tudominio.com
```

## ⚡ Comandos Clave

| Comando | Qué hace |
|---------|----------|
| `npm run build` | Compila React a `backend/public/dist/` |
| `composer install` | Instala dependencias PHP |
| `php -S localhost:8000 -t public` | Dev server local (backend) |
| `npm run dev` | Dev server local (frontend, Vite) |
| `composer test` | Corre 43 tests |
| `bash setup.sh` | Setup automático (Linux/Mac) |
| `.\setup.bat` | Setup automático (Windows) |

## 🔧 Requisitos Mínimos

```
Hostinger:
✓ PHP 8.2+
✓ ext-bcmath
✓ Apache con mod_rewrite
✓ HTTPS (Let's Encrypt gratis)

Local:
✓ PHP 8.2+
✓ Node.js 18+
✓ Composer
✓ npm
```

## 📁 Estructura Importante

```
SafeMoneyApp/
├── backend/public/
│   ├── index.php        ← API + Frontend Server
│   └── dist/            ← React compilado (generado)
├── frontend/src/        ← Código React (compila a dist/)
├── .htaccess            ← Reescritura de URLs
├── DEPLOY_HOSTINGER.md  ← Documentación completa
└── README.md            ← Este proyecto
```

## ❌ Problemas Rápidos

**404 en `/api/*`**
- Verifica que `mod_rewrite` está ON en Hostinger
- Los 3 `.htaccess` están presentes
- Reinicia Apache

**BCMath error**
- Panel Hostinger → PHP → Habilitar `bcmath`
- Reinicia PHP

**Frontend en blanco**
- Compila: `npm run build`
- Verifica: `backend/public/dist/index.html` existe

**CORS error**
- Edita `backend/.env`: `ALLOWED_ORIGIN=https://tudominio.com`
- Si es local: `ALLOWED_ORIGIN=*`

## 📊 Test Rápido

```bash
# API está vivo?
curl https://tudominio.com/api/v1/health

# Frontend carga?
curl https://tudominio.com/ | head -c 100

# Cálculo funciona?
curl -X POST https://tudominio.com/api/v1/interes-simple/calcular \
  -H "Content-Type: application/json" \
  -d '{"P":"1000","i":"0.10","n":"5","calcular":"F"}'
```

## 📚 Documentación

- **DEPLOY_HOSTINGER.md** ← Guía completa (10 min read)
- **HOSTINGER_CHECKLIST.md** ← Checklist de deployment
- **README.md** ← Stack técnico y features
- **docs/arquitectura.md** ← Arquitectura del proyecto

## 💡 Tips

- Compila siempre antes de subir: `npm run build`
- Usa `--no-dev` en Composer para producción
- Fuerza HTTPS en `.htaccess` (ya está configurado)
- Guarda un backup antes de hacer cambios
- Monitorea los logs de PHP en el panel Hostinger

## 🆘 Si Algo Falla

1. Lee [DEPLOY_HOSTINGER.md](DEPLOY_HOSTINGER.md) sección "Problemas Comunes"
2. Revisa los logs en Panel Hostinger → Logs → Error
3. Prueba healthcheck: `/api/v1/health`
4. Verifica permisos: `chmod 755 backend/public`

---

**Rama:** Cristian | **Estado:** Listo para Hostinger | **Última actualización:** 2026-05-27
