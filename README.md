# Ingeniería Económica - SafeMoneyApp

App web para resolver problemas de ingeniería económica con calculadoras interactivas. La idea es simple: tener una calculadora por cada tema, con la fórmula visible, el procedimiento paso a paso y la posibilidad de exportar el resultado.

**Estado:** Adaptada para Hostinger | **Rama:** Cristian | **Stack:** PHP 8.2 + Slim 4 + React 18 + TypeScript

> **Importante:** No hay base de datos. Todo vive en memoria mientras se usa, y si se quiere guardar un escenario se descarga como JSON.

## Lo que hace

Hay 17 módulos. Cada uno tiene su propia calculadora, su fórmula renderizada con KaTeX, un toggle para "ver procedimiento paso a paso" y un par de botones para exportar/importar el escenario.

Fundamentos:
- Reparto proporcional (simple y compuesto, capital × tiempo)
- Interés simple, con despejes de F, P, i, n
- Descuento simple, comercial y racional, con conversión d ↔ i

Interés compuesto y tasas:
- Interés compuesto con gráfica comparativa vs interés simple
- Tasa nominal ↔ periódica
- Tasa efectiva anual
- Equivalencia universal entre cualquier par de tasas
- Tasa anticipada ↔ vencida

Series uniformes:
- Capitalización (ahorro para meta futura)
- Anualidades vencidas
- Anualidades anticipadas
- Anualidades diferidas con periodo de gracia
- Perpetuidades vencidas y anticipadas

Amortización y avanzados:
- Tablas de amortización en los cuatro sistemas: francés, alemán, americano y colombiano (con inflación opcional)
- Abonos extraordinarios reduciendo el plazo
- Abonos extraordinarios reduciendo la cuota
- Ecuaciones de valor con línea de tiempo y solver de X

En el header hay un selector entre **año comercial (360 días)** y **año civil (365 días)**. La preferencia se guarda en `localStorage` y aparece en el footer y en cualquier JSON que se exporte. Así no hay ambigüedad académica sobre con qué convención se hizo el cálculo.

Los montos se muestran en formato colombiano (`$ 1.234.567,89`) usando `Intl.NumberFormat('es-CO')`.

## Stack

Backend en PHP 8.2 con Slim 4 y BCMath. Toda la matemática usa BCMath con escala interna de 30 dígitos, así que no hay floats en los cálculos finales. Las funciones `ln`, `exp` y potencia con exponente fraccionario están escritas a mano como series de Taylor porque `bcpow` solo acepta enteros.

Frontend en React 18 con TypeScript, Vite, Tailwind (tema oscuro único), KaTeX para fórmulas, Recharts para la gráfica comparativa y Zustand para la preferencia del año.

Tests con PHPUnit. 43 casos verificados contra valores de Baca Currea, Meza Orozco y Blank & Tarquin.

## 🚀 Inicio Rápido

### Requisitos Previos

- **PHP 8.2+** con extensiones: `bcmath`, `json`, `mbstring`, `openssl`, `curl`
- **Node.js 18+** y **npm**
- **Composer** (recomendado para instalar dependencias)

### Instalación Local (Automática)

#### Windows:
```bash
setup.bat
```

#### Linux/Mac:
```bash
bash setup.sh
```

### Instalación Local (Manual)

1. **Backend:**
   ```bash
   cd backend
   composer install
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

### Desarrollo Local

**Terminal 1 - Backend:**
```bash
cd backend
php -S localhost:8000 -t public
```

**Terminal 2 - Frontend (Vite dev):**
```bash
cd frontend
npm run dev
```

Abre `http://localhost:5173`

### Tests

```bash
cd backend
composer test
```

Esperado: `OK (43 tests, 65 assertions)`

## 🌐 Deploy en Hostinger (⭐ IMPORTANTE)

**Ver documentación completa:** [DEPLOY_HOSTINGER.md](DEPLOY_HOSTINGER.md)

### Pasos resumidos:

1. **Compilar frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Subir a Hostinger:**
   - Sube `backend/` a `public_html/`
   - Sube los 3 archivos `.htaccess` (raíz, backend, backend/public)

3. **En el servidor (SSH/Terminal):**
   ```bash
   cd public_html/backend
   composer install --no-dev --optimize-autoloader
   ```

4. **Verificar:**
   - `https://tudominio.com/api/v1/health`
   - `https://tudominio.com/`

## 📁 Estructura del Proyecto

```
SafeMoneyApp/
├── backend/
│   ├── src/Finance/         # Cálculos (BCMath, 30 dígitos)
│   ├── src/Http/            # API endpoints
│   ├── public/
│   │   ├── index.php        # Entrypoint
│   │   └── dist/            # Frontend compilado (generado)
│   ├── tests/
│   ├── vendor/              # Dependencias (composer)
│   ├── .env.example
│   └── .htaccess
├── frontend/
│   ├── src/
│   │   ├── components/      # Calculadoras React
│   │   ├── pages/           # 17 módulos
│   │   ├── store/           # Estado (Zustand)
│   │   └── lib/             # Utilidades
│   ├── vite.config.build.ts # Config para integración con backend
│   └── package.json
├── docs/
│   ├── arquitectura.md
│   └── casos-canonicos.md
├── .htaccess                # Reescritura de URLs (Hostinger)
├── DEPLOY_HOSTINGER.md      # Guía completa de deployment
├── setup.sh                 # Setup automático (Linux/Mac)
├── setup.bat                # Setup automático (Windows)
└── README.md                # Este archivo
```

## 📊 Módulos (17 calculadoras)

### Fundamentos
- Reparto proporcional (simple y compuesto)
- Interés simple (con despejes)
- Descuento simple (comercial y racional)

### Interés Compuesto y Tasas
- Interés compuesto (con gráfica vs simple)
- Tasa nominal ↔ periódica
- Tasa efectiva anual
- Equivalencia universal de tasas
- Tasa anticipada ↔ vencida

### Series Uniformes
- Capitalización
- Anualidades vencidas, anticipadas, diferidas
- Perpetuidades

### Amortización y Avanzados
- Tablas: francés, alemán, americano, colombiano (+ inflación)
- Abonos extra (reducir tiempo/cuota)
- Ecuaciones de valor (solver de X)

## ⚙️ Stack Técnico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Backend** | PHP | 8.2+ |
| **Framework** | Slim | 4.12 |
| **Precisión** | BCMath | 30 dígitos |
| **Frontend** | React | 18 |
| **Lenguaje** | TypeScript | 5.6+ |
| **Build** | Vite | 5.4+ |
| **CSS** | Tailwind | 3.4+ |
| **Fórmulas** | KaTeX | 0.16+ |
| **Gráficos** | Recharts | 2.13+ |
| **Estado** | Zustand | 5.0+ |
| **Testing** | PHPUnit | 10.5 |

## 🔧 Configuración

### Variables de Entorno

Copia `backend/.env.example` a `backend/.env`:

```env
APP_ENV=production              # o development
APP_DEBUG=false                 # cambiar solo en desarrollo
ALLOWED_ORIGIN=*               # en prod: https://tudominio.com
DB_HOST=localhost              # (preparado para futuro)
```

### Permisos en Hostinger

```bash
chmod 755 backend/public
chmod 755 backend/public/dist
chmod 644 .htaccess backend/.htaccess backend/public/.htaccess
```

## 📝 API Endpoints

Todos bajo `/api/v1/` (JSON):

- `GET  /api/v1/health` — healthcheck
- `GET  /api/v1/modulos` — catálogo
- `POST /api/v1/interes-simple/calcular`
- `POST /api/v1/interes-compuesto/calcular`
- `POST /api/v1/tasas/convertir`
- `POST /api/v1/anualidades/calcular`
- `POST /api/v1/amortizacion/generar`
- `POST /api/v1/ecuaciones-valor/resolver`
- ...y más (ver [index.php](backend/public/index.php))

**Respuesta exitosa:**
```json
{
  "ok": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "...",
    "field": "P" 
  }
}
```

## 🐛 Troubleshooting

### Error 404 en `/api/v1/*`

- ✓ Verifica que `mod_rewrite` está habilitado
- ✓ Los 3 `.htaccess` están presentes (raíz, backend, backend/public)
- ✓ Reinicia Apache en Hostinger

### BCMath no encontrado

```bash
# Linux
sudo apt-get install php-bcmath

# Mac (Homebrew)
brew install php82-bcmath

# Windows (XAMPP)
# Descomenta extension=bcmath en php.ini
```

### Frontend no se carga

- ✓ Compila: `npm run build`
- ✓ Verifica: `backend/public/dist/index.html` existe
- ✓ Permisos: `chmod 755 backend/public/dist`

## 📚 Bibliografía

- Baca Currea, G. (2014). *Ingeniería Económica*
- Meza Orozco, J. J. (2015). *Matemáticas Financieras Aplicadas*
- Blank, L., & Tarquin, A. (2018). *Engineering Economy* (8ª ed.)

## 📄 Licencia

MIT

## ✅ Verificación Rápida

Con los servidores levantados:

- **Interés compuesto**: P=1000, i=0.10, n=5 → F = $1.610,51 ✓
- **Anualidad vencida**: A=100, i=0.05, n=10 → P = $772,17 ✓  
- **Amortización francés**: P=10.000.000, i=0.02, n=12 → Cuota = $945.595,97 ✓
- **Toggle 360/365**: Cambia y verifica footer + exports ✓
- **Exportar/Importar**: Descarga JSON, recarga, sube → Estado idéntico ✓

---

**Última actualización:** 2026-05-27  
**Rama:** Cristian (Adaptada para Hostinger)  
**Estado:** ✅ Listo para producción

