# Arquitectura

## Visión general

```
┌─────────────────────────────┐         ┌──────────────────────────────┐
│ Frontend (React + Vite)     │   HTTP  │ Backend (PHP 8.2 + Slim 4)  │
│ http://localhost:5173       │ ──────► │ http://localhost:8080        │
│                             │  JSON   │                              │
│ 17 calculadoras             │         │  /api/v1/* endpoints         │
│ Zustand (preferencia 360/365│         │  Validators + Errors typed   │
│ Tailwind dark theme         │         │                              │
│ KaTeX + Recharts            │         │  src/Finance/* (core puro)   │
└─────────────────────────────┘         │  BCMath scale 30             │
                                        └──────────────────────────────┘
```

Sin base de datos. El estado del usuario vive en `useState` por módulo y se persiste opcionalmente como JSON exportado.

## Backend

### Core financiero (`src/Finance/`)

Cada clase es **estática y pura** (sin dependencias HTTP):

- **`Money.php`** — Envoltura BCMath. Implementa `add`, `sub`, `mul`, `div`, `pow` (con exponente entero y fraccionario), `ln` y `exp` por series de Taylor, `nthRoot`, `round` con half-away-from-zero. Escala interna = 30 dígitos.
- **`DayCount.php`** — Convenciones 360/365, conversión días ↔ años, mapeo de frecuencias.
- **`Rate.php`** — Nominal ↔ periódica ↔ efectiva ↔ anticipada ↔ vencida. `convertir()` universal que usa EA como pivote.
- **`SimpleInterest.php`** — `I = P·i·n`, despejes de F, P, i, n.
- **`SimpleDiscount.php`** — Comercial y racional, conversión d ↔ i.
- **`CompoundInterest.php`** — `F = P(1+i)^n`, despejes, interés total, serie comparativa simple vs compuesto.
- **`Annuity.php`** — Vencidas, anticipadas, diferidas, perpetuidades, cuota dado P o F, despeje de n por logaritmo y de i por Newton-Raphson.
- **`Amortization.php`** — Tablas: francés, alemán, americano, colombiano (con inflación opcional).
- **`ExtraPayment.php`** — Abonos extras reduciendo tiempo o cuota.
- **`ValueEquation.php`** — Solver lineal de X en flujos a fecha focal.
- **`ProportionalSplit.php`** — Simple y compuesto (capital × tiempo).

Todos devuelven `{ resultado: string, pasos: [{ expr, detalle? }] }` para que el frontend muestre el procedimiento didáctico.

### Capa HTTP (`src/Http/`)

- **`Errors.php`** — Helpers `ok(data)` y `fail(code, message, field?, status)`.
- **`Validators.php`** — `num`, `int`, `str` (con `allowed`) y `required` con normalización de input (acepta comas como separador decimal).

### Punto de entrada (`public/index.php`)

Slim 4 con `addBodyParsingMiddleware`. Define las rutas inline en closures que invocan las clases estáticas de `Finance`. CORS abierto para que el dev server de Vite pueda llamar. Manejo de errores convierte `InvalidArgumentException` en HTTP 400 con `code = VALIDATION_ERROR`.

### Tests (`tests/Finance/`)

PHPUnit con 43 casos cubriendo todos los módulos contra valores de libros de texto.

## Frontend

### Estructura

```
src/
├── components/
│   ├── Calculator.tsx     Layout de página de calculadora
│   ├── Formula.tsx        KaTeX wrapper
│   ├── InputField.tsx     Input + Select + ResultValue (helpers)
│   ├── Layout.tsx         Header con selector 360/365 + sidebar
│   ├── ResultTable.tsx    Tabla de amortización con export CSV
│   ├── ScenarioIO.tsx     Import/export JSON por módulo
│   ├── StepByStep.tsx     Toggle "ver procedimiento"
│   └── Timeline.tsx       Línea de tiempo SVG
├── lib/
│   ├── api.ts             Cliente fetch tipado
│   ├── format.ts          fmtCOP, fmtNum, fmtRate (Intl.NumberFormat es-CO)
│   └── timeUnits.ts       Mapeo de frecuencias (mensual=12, etc.)
├── pages/                 17 módulos del temario
├── store/
│   └── index.ts           Zustand: { dayBase: 360 | 365 }
├── App.tsx                Routing
├── main.tsx
└── index.css              Tailwind + tokens
```

### Tema oscuro

Paleta inspirada en UI UX Pro Max:

| Token | Valor | Uso |
|---|---|---|
| `bg.DEFAULT` | `#0a0e14` | Fondo principal |
| `bg.surface` | `#11161f` | Tarjetas |
| `bg.elevated` | `#1a212c` | Hover, inputs |
| `bg.border` | `#252d3a` | Bordes |
| `text.DEFAULT` | `#e6edf3` | Texto principal |
| `text.muted` | `#8b949e` | Labels, descripciones |
| `text.subtle` | `#6e7681` | Hints, footnotes |
| `accent.DEFAULT` | `#7c9eff` | Botones, focus, resultados destacados |
| `success` | `#22c55e` | Abonos, valores positivos |
| `warning` | `#f59e0b` | Intereses |
| `danger` | `#ef4444` | Errores, pagos |

Tipografías: **Inter** (UI) y **JetBrains Mono** (números, fórmulas).

### Flujo de datos en cada módulo

1. Usuario edita inputs → estado local `useState` actualizado.
2. Click "Calcular" → `apiPost('/endpoint', body)`.
3. Vite proxy redirige `/api/*` a `http://localhost:8080`.
4. Backend valida, ejecuta el cálculo en `src/Finance/*`, devuelve JSON.
5. Frontend muestra resultado formateado + pasos didácticos.
6. Usuario puede exportar JSON con el botón "Exportar escenario".

### Convenciones de formato

- Moneda: `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' })` → `$ 1.234.567,89`.
- Tasas: 4 decimales con sufijo `%`.
- Números genéricos: 4 decimales con separadores locales.

## Precisión numérica

El backend hace **toda** la matemática con BCMath a escala interna 30. El frontend recibe strings y los pasa a `Intl.NumberFormat` (que internamente convierte a número, perdiendo precisión sólo en el último paso de presentación). Esto significa:

- Cálculos compuestos como tablas de amortización mantienen precisión exacta hasta el último período.
- Pequeñas diferencias en el saldo final (típicamente $0,01 a $0,10) son resultado del redondeo monetario a 2 decimales por cuota, no de errores numéricos.
- Las series `ln` y `exp` convergen a 1e-30 antes del último redondeo, dando precisión efectiva > 1e-10 para todas las tasas anuales razonables.

## Decisiones omitidas y por qué

- **Sin OpenAPI generado** — Por brevedad de la entrega académica; los endpoints están documentados en este archivo y en el README. Se puede agregar con `zircote/swagger-php` cuando se requiera.
- **Sin tests E2E del frontend** — Verificación manual con `chrome-devtools` durante el desarrollo. Para una versión de producción se agregaría Playwright.
- **Sin code-splitting agresivo** — Vite advierte de chunk grande (~870 KB) por la combinación de KaTeX + Recharts. Aceptable para una app académica de un solo despliegue; en producción se agregaría `manualChunks` en `vite.config.ts`.
