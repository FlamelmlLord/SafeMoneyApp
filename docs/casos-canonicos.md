# Casos canónicos verificados

Cada módulo se ha verificado contra valores de referencia tomados de los libros clásicos del temario (Baca Currea, Meza Orozco, Blank & Tarquin). Los 43 tests en `backend/tests/Finance/` validan estos casos automáticamente.

## Interés Simple

| Caso | Entradas | Resultado esperado |
|---|---|---|
| Despeje de F | P=1000, i=10%, n=2 | F = 1200 |
| Despeje de I | P=1000, i=10%, n=2 | I = 200 |
| Despeje de i | P=1000, F=1200, n=2 | i = 10% |
| Despeje de n | P=1000, F=1200, i=10% | n = 2 |

## Descuento Simple

| Caso | Entradas | Resultado esperado |
|---|---|---|
| Comercial | F=1000, d=10%, n=0.5 | D=50, Vt=950 |
| Racional | F=1000, i=10%, n=0.5 | D_r ≈ 47.62, Vt ≈ 952.38 |
| Conversión d→i | d=10%, n=0.5 | i ≈ 10.526% |

## Interés Compuesto

| Caso | Entradas | Resultado esperado |
|---|---|---|
| Despeje de F | P=1000, i=10%, n=5 | F = 1610.51 |
| Despeje de P | F=1610.51, i=10%, n=5 | P ≈ 1000 |
| Despeje de n | P=1000, F=1610.51, i=10% | n ≈ 5 |
| Despeje de i | P=1000, F=1610.51, n=5 | i ≈ 10% |
| Interés total | P=1000, i=10%, n=5 | I = 610.51 |

## Tasas

| Caso | Entradas | Resultado esperado |
|---|---|---|
| Nominal → Periódica | J=24%, m=12 | i = 2% mensual |
| Periódica → Efectiva | i=2% mensual, m=12 | EA ≈ 26.824% |
| Efectiva → Periódica | EA=26.824%, m=12 | i ≈ 2% |
| Vencida → Anticipada | i=10% | i_a ≈ 9.091% |
| Anticipada → Vencida | i_a=9.091% | i ≈ 10% |
| Convertir universal (Nominal → Efectiva) | J=24%, m=12 → m=1 | EA ≈ 26.824% |

## Anualidades

Todos calculados con A=100, i=5%, n=10 salvo indicación.

| Caso | Resultado esperado |
|---|---|
| Valor Presente vencida | P ≈ 772.17 |
| Valor Futuro vencida | F ≈ 1257.79 |
| Valor Presente anticipada | P_ant ≈ 810.78 |
| Perpetuidad vencida (A=100, i=5%) | VP∞ = 2000 |
| Cuota dado P (P=10000, i=2%, n=5) | A ≈ 2121.58 |
| Cuota dado F (F=1000, i=5%, n=10) | A ≈ 79.50 |
| Diferida k=3 | P_dif ≈ 667.03 |
| Caso tasa cero (A=100, i=0, n=10) | P = F = 1000 |

## Amortización

Caso base: P=10.000, i=2%, n=5.

| Sistema | Verificación |
|---|---|
| Francés (cuota fija) | Cuota = 2121.58, saldo final ≈ 0, total intereses ≈ 607.90 |
| Alemán (capital fijo) | Abono periódico fijo = 2000 |
| Americano | Cuotas 1-4 = 200 (sólo interés), cuota 5 = 10.200 (interés + capital) |
| Colombiano (sin inflación) | Coincide con francés |
| Colombiano (con inflación π > 0) | Cuota crece con π, tasa real = (1+i)/(1+π) − 1 |

## Abonos Extraordinarios

| Caso | Entradas | Verificación |
|---|---|---|
| Reducir tiempo | P=10.000, i=2%, n=10, abono=1000 en período 3 | n_nuevo < 10, períodos ahorrados > 0 |
| Reducir cuota | P=10.000, i=2%, n=10, abono=1000 en período 3 | cuota_nueva < cuota_original |

## Reparto Proporcional

| Caso | Entradas | Resultado esperado |
|---|---|---|
| Simple | 1000 entre pesos [3, 2, 5] | [300, 200, 500] |
| Compuesto | 600 entre (cap 100, t 2), (cap 200, t 1), (cap 100, t 1) | [240, 240, 120] |

## Ecuaciones de Valor

| Caso | Entradas | Resultado esperado |
|---|---|---|
| Dos cuotas iguales | Deuda 1000 en n=0, dos cuotas X en n=6 y n=12 a i=1% mensual | X ≈ 546.60 |

## Money helper (BCMath)

| Operación | Verificación |
|---|---|
| add/sub/mul/div | Aritmética básica exacta a escala 30 |
| pow entero | 2^5 = 32 |
| pow fraccionario | 8^(1/3) ≈ 2 (con error < 1e-10) |
| ln | ln(e) = 1, ln(1) = 0 |
| exp | exp(0) = 1, exp(1) ≈ 2.71828 |
| nthRoot | √27³ = 3, √16⁴ = 2 |
| round half-away-from-zero | 1.235 → 1.24, -1.235 → -1.24 |

## Convención de año

Todos los casos se calculan con la convención **año comercial (360 días)** por defecto. La preferencia se puede cambiar en el header de la app y queda visible en el footer y los exports JSON/CSV para evitar ambigüedad académica.

## Cómo correr los tests

```powershell
cd backend
./vendor/bin/phpunit --testdox
```

Salida esperada: `Tests: 43, Assertions: 65, OK`.
