# Ingeniería Económica

App web para resolver los problemas que el profesor pidió en el curso. La idea es simple: tener una calculadora por cada tema, con la fórmula visible, el procedimiento paso a paso y la posibilidad de exportar el resultado.

No hay base de datos. Todo vive en memoria mientras se usa, y si se quiere guardar un escenario se descarga como JSON.

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

## Requisitos

Para correrlo necesitas tener instalado:

- **PHP 8.2 o superior**, con las extensiones `bcmath`, `mbstring`, `openssl` y `curl` activas en el `php.ini`.
- **Composer** (el gestor de paquetes de PHP). Si no está, se descarga el `.phar` desde getcomposer.org y se ejecuta con PHP.
- **Node.js 18 o superior** y **npm**.

En Windows con winget:

```powershell
winget install PHP.PHP.8.2
winget install OpenJS.NodeJS.LTS
```

Composer no está en winget, así que toca descargar el `.phar` manualmente:

```powershell
Invoke-WebRequest -Uri "https://getcomposer.org/composer-stable.phar" -OutFile "composer.phar"
```

Después de instalar PHP, hay que copiar `php.ini-development` a `php.ini` y descomentar las líneas `extension=openssl`, `extension=mbstring`, `extension=curl` y `extension=bcmath`. Sin esas extensiones Composer no descarga nada y la app no arranca.

## Cómo correrlo

Hay que abrir dos terminales, una para el backend y otra para el frontend.

### Backend

```powershell
cd backend
composer install
php -S localhost:8080 -t public
```

Queda escuchando en `http://localhost:8080`. Para probar que está vivo:

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/health"
```

Debe responder con `{ ok: true, data: { status: 'ok', phpVersion: '8.2.x' } }`.

### Frontend

En otra terminal:

```powershell
cd frontend
npm install
npm run dev
```

Vite arranca en `http://localhost:5173` y proxea las llamadas a `/api/*` hacia el backend. Si todo está bien, al abrir esa URL aparece la pantalla de inicio con las 17 tarjetas de módulos.

### Tests

```powershell
cd backend
./vendor/bin/phpunit
```

Salida esperada:

```
OK (43 tests, 65 assertions)
```

Si alguno falla, el problema casi seguro está en `src/Finance/`, no en los tests. Los valores esperados vienen de libros y están comentados arriba de cada test.

## Verificación rápida

Para confirmar que todo funciona, con los dos servidores arriba se pueden probar estos casos:

- **Interés compuesto**: P=1000, i=0.10, n=5. Debe dar F = $1.610,51.
- **Anualidad vencida**: A=100, i=0.05, n=10. Debe dar P = $772,17 y F = $1.257,79.
- **Amortización francés**: P=10.000.000, i=0.02, n=12. Cuota fija de $945.595,97.
- **Ecuaciones de valor**: deuda de 1.000.000 en n=0 que se paga con dos cuotas iguales X en n=6 y n=12 al 1% mensual. X = $546.599,09.
- **Toggle 360/365**: cambiarlo en el header y revisar que el footer y los exports JSON reflejen el cambio.
- **Exportar e importar**: en cualquier módulo, exportar el escenario como JSON, recargar la página y volver a importarlo. El estado debe quedar idéntico.

## Estructura del proyecto

```
Aplicación/
├── backend/
│   ├── src/
│   │   ├── Finance/         Core matemático puro
│   │   │   ├── Money.php          BCMath wrapper + ln, exp, pow, round
│   │   │   ├── DayCount.php       Convenciones 360/365
│   │   │   ├── Rate.php           Conversiones de tasas
│   │   │   ├── SimpleInterest.php
│   │   │   ├── SimpleDiscount.php
│   │   │   ├── CompoundInterest.php
│   │   │   ├── Annuity.php        Vencidas, anticipadas, diferidas, perpetuidades
│   │   │   ├── Amortization.php   Francés, alemán, americano, colombiano
│   │   │   ├── ExtraPayment.php   Abonos extra
│   │   │   ├── ValueEquation.php  Solver de ecuaciones de valor
│   │   │   └── ProportionalSplit.php
│   │   └── Http/
│   │       ├── Errors.php
│   │       └── Validators.php
│   ├── tests/Finance/       43 tests PHPUnit
│   ├── public/index.php     Entrypoint Slim 4
│   ├── composer.json
│   └── phpunit.xml
│
├── frontend/
│   ├── src/
│   │   ├── pages/           17 módulos
│   │   ├── components/      Calculator, Formula, Timeline, ResultTable, StepByStep, ScenarioIO, Layout, InputField
│   │   ├── lib/             api.ts, format.ts, timeUnits.ts
│   │   ├── store/           Zustand (preferencia 360/365)
│   │   ├── App.tsx          Rutas
│   │   ├── main.tsx
│   │   └── index.css        Tailwind + tokens del tema oscuro
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── package.json
│
└── docs/
    ├── arquitectura.md
    └── casos-canonicos.md   Tabla completa de casos verificados
```

## API

Todos los endpoints están bajo `/api/v1/` y reciben JSON. Las respuestas tienen la forma `{ ok: true, data: ... }` cuando todo sale bien, o `{ ok: false, error: { code, message, field? } }` cuando hay un error de validación o interno.

Los principales:

- `GET  /api/v1/health` — healthcheck
- `GET  /api/v1/modulos` — catálogo de módulos disponibles
- `POST /api/v1/interes-simple/calcular`
- `POST /api/v1/descuento-simple/calcular`
- `POST /api/v1/descuento-simple/convertir-tasa`
- `POST /api/v1/interes-compuesto/calcular`
- `POST /api/v1/interes-compuesto/comparativa`
- `POST /api/v1/tasas/convertir`
- `POST /api/v1/tasas/anticipada-vencida`
- `POST /api/v1/anualidades/calcular`
- `POST /api/v1/amortizacion/generar`
- `POST /api/v1/abonos-extra/reducir-tiempo`
- `POST /api/v1/abonos-extra/reducir-cuota`
- `POST /api/v1/ecuaciones-valor/resolver`
- `POST /api/v1/reparto/simple`
- `POST /api/v1/reparto/compuesto`

Ejemplo de llamada con PowerShell:

```powershell
$body = @{ P='1000'; i='0.10'; n='5'; calcular='F' } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/interes-compuesto/calcular" `
                  -Method POST -ContentType "application/json" -Body $body
```

Devuelve `{ ok: true, data: { resultado: '1610.5100000000', pasos: [...] } }`.

## Notas sobre precisión

El backend hace todo con BCMath a 30 decimales internos y redondea a 2 decimales para mostrar valores monetarios y a 10 para tasas. El frontend recibe strings y solo formatea, nunca recalcula.

En tablas de amortización el saldo final puede quedar en $0,01 o $0,05 por la acumulación del redondeo monetario en cada cuota. Es el mismo comportamiento que muestran los libros y los simuladores bancarios; no es un error numérico.

El sistema colombiano de amortización está implementado como "cuota constante en pesos con corrección por inflación opcional". Si la inflación es 0, el resultado coincide exactamente con el sistema francés. Si se pasa una inflación > 0, la cuota crece con el factor inflacionario y la tasa efectiva real se calcula como `(1+i)/(1+π) - 1`.

## Lo que no está

- No hay deploy, todo corre en local.
- No hay autenticación ni usuarios. Cualquiera con acceso a las URLs puede usar la app.
- El frontend genera un único bundle de ~870 KB (254 KB gzip). Vite avisa que conviene partirlo, pero para una app académica de un solo despliegue no vale la pena meterse en eso.
- No hay OpenAPI generado automáticamente. Los endpoints están listados arriba y eso debería bastar.
- No hay tests E2E del frontend. La verificación se hizo con chrome-devtools MCP a mano durante el desarrollo.
