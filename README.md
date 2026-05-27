# Aplicación de Ingeniería Económica

Aplicación web académica para el curso de **Ingeniería Económica**. Implementa los 17 conceptos del temario con calculadoras interactivas, fórmulas renderizadas, paso a paso didáctico, líneas de tiempo, tablas de amortización y exportación CSV/JSON.

- **Backend**: PHP 8.2 + Slim 4 + **BCMath** (precisión decimal arbitraria — sin floats en cálculos finales).
- **Frontend**: React 18 + TypeScript + Vite + Tailwind (tema oscuro) + KaTeX + Recharts + Zustand.
- **Sin base de datos**: todo el estado vive en el cliente, con import/export de escenarios como JSON.
- **Tests**: PHPUnit con 43 casos canónicos verificados contra libros de texto (Baca Currea, Meza Orozco, Blank & Tarquin).

## Módulos implementados

| # | Módulo | Categoría |
|---|---|---|
| 1 | Reparto Proporcional (simple y compuesto) | Fundamentos |
| 2 | Interés Simple (despejes de F, P, i, n) | Fundamentos |
| 3 | Descuento Simple (comercial y racional) | Fundamentos |
| 4 | Interés Compuesto + comparativa visual vs simple | Compuesto |
| 5 | Tasa Nominal ↔ Periódica | Tasas |
| 6 | Tasa Efectiva Anual (EA) | Tasas |
| 7 | Equivalencia universal de tasas | Tasas |
| 8 | Tasa Anticipada ↔ Vencida | Tasas |
| 9 | Capitalización (ahorro para meta) | Series |
| 10 | Anualidades Vencidas | Series |
| 11 | Anualidades Anticipadas | Series |
| 12 | Anualidades Diferidas | Series |
| 13 | Perpetuidades (vencida y anticipada) | Series |
| 14 | Tablas de Amortización: **francés, alemán, americano, colombiano** | Amortización |
| 15 | Abonos Extra — Reducir Tiempo | Amortización |
| 16 | Abonos Extra — Reducir Cuota | Amortización |
| 17 | Ecuaciones de Valor (solver con línea de tiempo) | Avanzados |

## Selector global de tipo de año

En el header de la app aparece un selector entre **año comercial (360 días)** y **año civil (365 días)**. La preferencia se persiste en `localStorage` y se muestra en el footer y en los archivos JSON exportados.

## Requisitos

- **PHP 8.2+** con las extensiones `bcmath`, `mbstring`, `openssl`, `curl`.
- **Composer** (gestor de dependencias PHP).
- **Node.js 18+** y **npm**.

En Windows, ambos se pueden instalar vía `winget install PHP.PHP.8.2` y `winget install OpenJS.NodeJS.LTS`. Composer se obtiene de https://getcomposer.org/download/.

## Estructura

```
Aplicación/
├── backend/           PHP 8.2 + Slim 4 + BCMath
│   ├── src/
│   │   ├── Finance/   Core financiero puro (sin HTTP)
│   │   └── Http/      Errores y validadores
│   ├── tests/         PHPUnit (43 casos)
│   ├── public/        index.php (entrypoint)
│   └── composer.json
├── frontend/          React + Vite + TS
│   ├── src/
│   │   ├── pages/     17 módulos
│   │   ├── components/  Calculator, Formula, Timeline, etc.
│   │   ├── lib/       api.ts, format.ts, timeUnits.ts
│   │   └── store/     Zustand (preferencia 360/365)
│   └── package.json
└── docs/
    ├── arquitectura.md
    └── casos-canonicos.md
```

## Instalación y ejecución

### Backend

```powershell
cd backend
composer install
php -S localhost:8080 -t public
```

Quedará escuchando en `http://localhost:8080`.

Para correr los tests:

```powershell
cd backend
./vendor/bin/phpunit
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Quedará servido en `http://localhost:5173` y las llamadas a `/api/v1/*` se proxean automáticamente al backend en `:8080`.

### Verificación rápida

Con ambos servidores corriendo, abrir `http://localhost:5173` y:

1. Probar **Interés Compuesto** con P=1000, i=0.10, n=5 → debe dar **F = $1.610,51**.
2. Probar **Amortización** con P=10.000.000, i=0.02, n=12, sistema "francés" → cuota fija **$945.595,97**.
3. Probar **Anualidades Vencidas** con A=100, i=0.05, n=10 → **P = $772,17** y **F = $1.257,79**.
4. Probar **Ecuaciones de Valor**: deuda 1.000.000 en n=0 que se paga con dos cuotas iguales X en n=6 y n=12 a i=1% → **X = $546.599,09**.
5. Cambiar el selector 360/365 en el header y verificar que el footer y los exports reflejen el cambio.
6. Exportar un escenario JSON desde cualquier módulo, recargar la página e importarlo de vuelta — debe reproducir el cálculo.

## API REST

Todos los endpoints viven bajo `/api/v1/`. Reciben JSON y devuelven `{ ok: true, data: ... }` o `{ ok: false, error: { code, message, field? } }`.

Endpoints principales:

- `POST /api/v1/interes-simple/calcular`
- `POST /api/v1/descuento-simple/calcular`
- `POST /api/v1/descuento-simple/convertir-tasa`
- `POST /api/v1/interes-compuesto/calcular`
- `POST /api/v1/interes-compuesto/comparativa`
- `POST /api/v1/tasas/convertir`
- `POST /api/v1/tasas/anticipada-vencida`
- `POST /api/v1/anualidades/calcular` (vencida, anticipada, diferida, perpetuidad)
- `POST /api/v1/amortizacion/generar` (francés, alemán, americano, colombiano)
- `POST /api/v1/abonos-extra/reducir-tiempo`
- `POST /api/v1/abonos-extra/reducir-cuota`
- `POST /api/v1/ecuaciones-valor/resolver`
- `POST /api/v1/reparto/simple` y `/reparto/compuesto`
- `GET  /api/v1/health` y `/api/v1/modulos`

## Tema visual

Tema oscuro único (paleta UI UX Pro Max), tipografía Inter + JetBrains Mono para números. Diseño responsive (mobile-first) con sidebar plegable en pantallas pequeñas. Accesibilidad WCAG AA con navegación por teclado y contraste alto.

## Precisión numérica

Todos los cálculos del backend se realizan con **BCMath** a escala interna de 30 decimales. El frontend nunca recalcula valores financieros — sólo formatea con `Intl.NumberFormat('es-CO')` para mostrar `$1.234.567,89` (formato colombiano).

Las funciones que requieren `ln` / `exp` / `x^y` con exponente fraccionario están implementadas como series de Taylor en `Money.php` para evitar la limitación de `bcpow` a exponentes enteros.
