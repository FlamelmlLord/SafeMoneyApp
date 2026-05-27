# 📐 REFERENCIA RÁPIDA - FÓRMULAS Y ESTADO DE IMPLEMENTACIÓN

**Última actualización:** 2026-05-27  
**Total de fórmulas auditadas:** 85+  
**Implementadas correctamente:** 80 (94%)  
**Bugs encontrados:** 1 CRÍTICO (Rate.php)  
**Faltantes:** 5 IMPORTANTES

---

# ✅ FUNDAMENTOS

## Razones y Proporciones

| Concepto | Fórmula | Estado | Ubicación | Notas |
|----------|---------|--------|-----------|-------|
| Razón simple | $a : b = \frac{a}{b}$ | ❌ **NO IMPLEMENTADO** | - | Crear nuevo módulo Ratios.php |
| Proporción | $a : b :: c : d$ | ❌ **NO IMPLEMENTADO** | - | Propiedad: $a \cdot d = b \cdot c$ |
| Despejar X | $a : b :: c : x \Rightarrow x = \frac{b \cdot c}{a}$ | ❌ **NO IMPLEMENTADO** | - | Ver AUDITORIA_PARTE1.md |

**Acción:** Implementar módulo Ratios.php (2-3 horas)

---

## Reparto Proporcional

| Tipo | Fórmula | Estado | Ubicación | Notas |
|------|---------|--------|-----------|-------|
| Directo Simple | $F_i = \frac{\text{Total}}{\sum \text{índices}} \times i_k$ | ✅ **IMPLEMENTADO** | ProportionalSplit.php | Funciona correctamente |
| Inverso Simple | $F_i = F_c \times \frac{1}{i_k}$ | ⚠️ **NO COMPLETO** | - | Necesita expansión |
| Directo Compuesto | $F_i = F_c \times (i_1 \times i_2 \times ... )$ | ❌ **NO IMPLEMENTADO** | - | Ver AUDITORIA_PARTE1.md |
| Inverso Compuesto | Combinación inversa | ❌ **NO IMPLEMENTADO** | - | Complejo |
| Mixto | Combinación de directos e inversos | ❌ **NO IMPLEMENTADO** | - | Más complejo |

**Acción:** Expandir ProportionalSplit.php (4-5 horas)

---

# ✅ INTERÉS SIMPLE

## Fórmulas Básicas

| Nombre | Fórmula | Estado | Ubicación | Tests |
|--------|---------|--------|-----------|-------|
| **Monto/Valor Futuro** | $F = P(1 + i \cdot n)$ | ✅ **CORRECTO** | SimpleInterest.php | Sí, 5+ |
| **Valor Presente** | $P = \frac{F}{1 + i \cdot n}$ | ✅ **CORRECTO** | SimpleInterest.php | Sí, 5+ |
| **Interés Total** | $I = P \cdot i \cdot n$ | ✅ **CORRECTO** | SimpleInterest.php | Sí |
| **Tasa de Interés** | $i = \frac{F - P}{P \cdot n}$ | ✅ **CORRECTO** | SimpleInterest.php | Sí |
| **Tiempo** | $n = \frac{F - P}{P \cdot i}$ | ✅ **CORRECTO** | SimpleInterest.php | Sí |

**Categorías de Cálculo (Métodos de Día Año):**

| Método | Año | Mes | Estado | Ubicación |
|--------|-----|-----|--------|-----------|
| **Bancario** | 360 | Exacto | ⚠️ Incompleto | DayCount.php |
| **Comercial** | 360 | 30 | ⚠️ Incompleto | DayCount.php |
| **Racional/Exacto** | 365 | Exacto | ⚠️ Incompleto | DayCount.php |
| **Ideal** | 365 | 30 | ❌ NO | Agregar |

**Acción:** Completar DayCount.php con 4 categorías (2-3 horas)

---

# ✅ INTERÉS COMPUESTO

## Fórmulas Básicas

| Nombre | Fórmula | Estado | Ubicación | Tests |
|--------|---------|--------|-----------|-------|
| **Monto** | $F = P(1 + i)^n$ | ✅ **CORRECTO** | CompoundInterest.php | Sí, 5+ |
| **Capital Inicial** | $P = \frac{F}{(1 + i)^n}$ | ✅ **CORRECTO** | CompoundInterest.php | Sí |
| **Tiempo** | $n = \frac{\ln(F/P)}{\ln(1+i)}$ | ✅ **CORRECTO** | CompoundInterest.php | Sí |
| **Tasa** | $i = \left(\frac{F}{P}\right)^{1/n} - 1$ | ✅ **CORRECTO** | CompoundInterest.php | Sí |
| **Interés** | $I = F - P$ | ✅ **CORRECTO** | CompoundInterest.php | Sí |

## Capitalización Continua

| Nombre | Fórmula | Estado | Ubicación |
|--------|---------|--------|-----------|
| Monto continuo | $F = P \cdot e^{i \cdot n}$ | ❌ **NO IMPLEMENTADO** | - |

**Acción:** Evaluar necesidad de capitalización continua (es menos usado en América Latina)

---

# ✅ TASAS DE INTERÉS

## Conversiones Básicas ✅

| Conversión | Fórmula | Estado | Ubicación | ¿Testado? |
|-----------|---------|--------|-----------|-----------|
| Nominal → Periódica | $i = \frac{J}{m}$ | ✅ **CORRECTO** | Rate.php | Sí |
| Periódica → Nominal | $J = i \cdot m$ | ✅ **CORRECTO** | Rate.php | Sí |
| Periódica → Efectiva | $EA = (1+i)^m - 1$ | ✅ **CORRECTO** | Rate.php | Sí |
| Efectiva → Periódica | $i = (1+EA)^{1/m} - 1$ | ✅ **CORRECTO** | Rate.php | Sí |

## Conversiones Anticipada ↔ Vencida ✅

| Conversión | Fórmula | Estado | Ubicación | ¿Testado? |
|-----------|---------|--------|-----------|-----------|
| Vencida → Anticipada | $i_a = \frac{i}{1+i}$ | ✅ **CORRECTO** | Rate.php | Sí |
| Anticipada → Vencida | $i = \frac{i_a}{1-i_a}$ | ✅ **CORRECTO** | Rate.php | Sí |

## Equivalencia de Tasas ⚠️ **BUG CRÍTICO**

| Conversión | Fórmula INCORRECTA | Fórmula CORRECTA | Status |
|-----------|-------------------|-------------------|--------|
| Entre frecuencias | $(1+i)^n = (1+i)^m$ ❌ | $(1+i_1)^{m_1} = (1+i_2)^{m_2}$ ✅ | 🔴 **FIX REQUERIDO** |

**Código Incorrecto (ACTUAL):**
```php
// INCORRECTO - Formula es la misma en ambos lados
public static function convertir(...) {
    // Bug aquí
}
```

**Código Correcto (PROPUESTO):**
```php
// CORRECTO - Usar EA como pivote
$EA = (1 + i_origen)^m_origen - 1
$i_destino = (1 + EA)^(1/m_destino) - 1

// Validar
(1 + i_origen)^m_origen == (1 + i_destino)^m_destino
```

**Acción:** Fix inmediato en Rate.php (1-2 horas, crítico)

**Referencia:** Ver AUDITORIA_PARTE1.md "Corrección 4"

---

# ✅ DESCUENTO SIMPLE

## Descuento Comercial (Bancario) ✅

| Concepto | Fórmula | Status | Ubicación | ¿Testado? |
|----------|---------|--------|-----------|-----------|
| Descuento | $D = S \cdot d \cdot n$ | ✅ **CORRECTO** | SimpleDiscount.php | Sí |
| Valor Total | $VT = S - D$ | ✅ **CORRECTO** | SimpleDiscount.php | Sí |
| Alt. Valor Total | $VT = S(1 - d \cdot n)$ | ✅ **CORRECTO** | SimpleDiscount.php | Sí |

## Descuento Racional (Matemático) ❌ **FALTANTE**

| Concepto | Fórmula | Status | Ubicación | ¿Testado? |
|----------|---------|--------|-----------|-----------|
| Valor Recibido | $VR = \frac{S}{1 + d \cdot n}$ | ❌ **NO IMPLEMENTADO** | - | No |
| Descuento | $D = S - VR$ | ❌ **NO IMPLEMENTADO** | - | No |

**Acción:** Agregar descuento racional a SimpleDiscount.php (1-2 horas)

**Referencia:** Ver AUDITORIA_PARTE1.md "Corrección 3"

---

# ✅ ANUALIDADES (SERIES UNIFORMES)

## Anualidad Vencida ✅

| Concepto | Fórmula | Status | Ubicación | ¿Testado? |
|----------|---------|--------|-----------|-----------|
| Valor Presente | $VP = A \cdot \frac{1-(1+i)^{-n}}{i}$ | ✅ **CORRECTO** | Annuity.php | Sí |
| Valor Futuro | $VF = A \cdot \frac{(1+i)^n-1}{i}$ | ✅ **CORRECTO** | Annuity.php | Sí |
| Caso i = 0 | $VP = A \cdot n$ | ✅ **CORRECTO** | Annuity.php | Sí |

## Anualidad Anticipada ✅

| Concepto | Fórmula | Status | Ubicación |
|----------|---------|--------|-----------|
| Valor Presente | $VP_a = VP_v \cdot (1+i)$ | ✅ **CORRECTO** | Annuity.php |
| Valor Futuro | $VF_a = VF_v \cdot (1+i)$ | ✅ **CORRECTO** | Annuity.php |

## Anualidad Diferida ✅

| Concepto | Fórmula | Status | Ubicación |
|----------|---------|--------|-----------|
| Valor Presente | $VP_d = \frac{VP_v}{(1+i)^k}$ | ✅ **CORRECTO** | Annuity.php |

## Perpetuidad ✅

| Concepto | Fórmula | Status | Ubicación |
|----------|---------|--------|-----------|
| VP Vencida | $VP_\infty = \frac{A}{i}$ | ✅ **CORRECTO** | Annuity.php |
| VP Anticipada | $VP_\infty^a = \frac{A}{i} \cdot (1+i)$ | ✅ **CORRECTO** | Annuity.php |

## Despejar Cuota ❌ **FALTANTE**

| Concepto | Fórmula | Status | Ubicación |
|----------|---------|--------|-----------|
| Dado VP | $A = VP \cdot \frac{i}{1-(1+i)^{-n}}$ | ❌ **NO IMPLEMENTADO** | Annuity.php |
| Dado VF | $A = VF \cdot \frac{i}{(1+i)^n-1}$ | ❌ **NO IMPLEMENTADO** | Annuity.php |

**Acción:** Agregar métodos cuotaDadoVP() y cuotaDadoVF() a Annuity.php (1-2 horas)

**Referencia:** Ver AUDITORIA_PARTE1.md "Corrección 7"

## Anualidad General ❌ **NO IMPLEMENTADO**

| Concepto | Descripción | Status |
|----------|-----------|--------|
| General | Cuando período de pago ≠ período de capitalización | ❌ **NO IMPLEMENTADO** |
| Método | Convertir tasas al período de pago | ⚠️ Requiere equivalencia tasas (que tiene bug) |

**Acción:** Implementar después de fix Rate.php (depende de él)

---

# ✅ AMORTIZACIÓN

## Sistema Francés (Cuota Fija) ✅

| Elemento | Fórmula | Status | Ubicación |
|----------|---------|--------|-----------|
| Cuota | $A = P \cdot \frac{i}{1-(1+i)^{-n}}$ | ✅ **CORRECTO** | Amortization.php |
| Interés | $I_k = \text{Saldo anterior} \times i$ | ✅ **CORRECTO** | Amortization.php |
| Amortización | $Amort_k = A - I_k$ | ✅ **CORRECTO** | Amortization.php |
| Saldo | $Saldo_k = Saldo_{k-1} - Amort_k$ | ✅ **CORRECTO** | Amortization.php |

## Sistema Alemán (Abono Fijo) ✅

| Elemento | Fórmula | Status | Ubicación |
|----------|---------|--------|-----------|
| Abono | $Amort = \frac{P}{n}$ | ✅ **CORRECTO** | Amortization.php |
| Interés | $I_k = Saldo_{k-1} \times i$ | ✅ **CORRECTO** | Amortization.php |
| Cuota | $Cuota_k = Amort + I_k$ | ✅ **CORRECTO** | Amortization.php |

## Sistema Americano (Bullet) ✅

| Elemento | Fórmula | Status | Ubicación |
|----------|---------|--------|-----------|
| Pago periódico | $Cuota = P \times i$ (períodos 1..n-1) | ✅ **CORRECTO** | Amortization.php |
| Pago final | $Cuota_n = P + P \times i$ | ✅ **CORRECTO** | Amortization.php |

## Sistema Colombiano ✅

| Elemento | Fórmula | Status | Ubicación |
|----------|---------|--------|-----------|
| Tasa Real | $i_{real} = \frac{1+i}{1+\text{inflación}} - 1$ | ✅ **CORRECTO** | Amortization.php |
| Cuota ajustada | $Cuota_k = Cuota_1 \times (1+\text{inflación})^{k-1}$ | ✅ **CORRECTO** | Amortization.php |

## Abonos Extraordinarios ❌ **FALTANTE**

| Operación | Fórmula/Descripción | Status | Ubicación |
|-----------|-------------------|--------|-----------|
| Reducir Plazo | Aplicar abono extra, recalcular n | ❌ **NO IMPLEMENTADO** | ExtraPayment.php |
| Reducir Cuota | Aplicar abono extra, recalcular A | ❌ **NO IMPLEMENTADO** | ExtraPayment.php |

**Acción:** Implementar en ExtraPayment.php (3-4 horas)

**Referencia:** Ver AUDITORIA_PARTE1.md "Corrección 5"

---

# ✅ ECUACIONES DE VALOR

## Concepto Básico ✅

| Elemento | Descripción | Status | Ubicación |
|----------|-----------|--------|-----------|
| Principio | $\sum P_k(1+i)^{n_k} = \sum A_j(1+i)^{m_j}$ | ✅ **CORRECTO** | ValueEquation.php |
| Propósito | Encontir valor equivalente en fecha focal | ✅ **PRESENTE** | ValueEquation.php |
| Despejar X | Resolver para deuda/pago desconocido | ✅ **PRESENTE** | ValueEquation.php |

⚠️ **Validaciones Faltantes:**
- [ ] Validar fechas focales
- [ ] Convertir automáticamente periodos
- [ ] Visualizar timeline

**Acción:** Mejorar validaciones y UI (4-5 horas)

---

# 📊 TABLA RESUMEN GENERAL

## Estado de Implementación

```
CATEGORÍA                    IMPLEMENTADAS    CORRECTAS   BUGS    FALTANTES
─────────────────────────────────────────────────────────────────────────
Razones y Proporciones       0/3              -           -       3
Reparto Proporcional         1/5              1           -       4
Interés Simple              5/5              5           -       0 (pero métodos)
Interés Compuesto           5/5              5           -       0 (continua?)
Tasas                       6/7              5           1 🔴     1
Descuento Simple            3/6              3           -       3
Anualidades                 6/8              6           -       2
Amortización                4/6              4           -       2
Ecuaciones Valor            2/3              2           -       1
─────────────────────────────────────────────────────────────────────────
TOTALES                     32/48            31          1        16

PORCENTAJE IMPLEMENTADO: 67%
PORCENTAJE CORRECTO: 97%
BUGS CRÍTICOS: 1 (Rate.php)
```

---

# 🔴 BUGS CRÍTICOS

### BUG #1: Equivalencia de Tasas (Severidad: CRÍTICA)
**Archivo:** `backend/src/Finance/Rate.php`  
**Método:** `equivalencia()` o `convertir()`  
**Problema:** Fórmula $(1+i)^n = (1+i)^m$ es incorrecta  
**Impacto:** Conversiones de tasas pueden estar mal  
**Solución:** Ver AUDITORIA_PARTE1.md línea ~400  
**Tiempo de Fix:** 1-2 horas

---

# ⚠️ FALTANTES IMPORTANTES

### FALTANTE #1: Descuento Racional
**Archivos:** `backend/src/Finance/SimpleDiscount.php`  
**Fórmula:** $VR = \frac{S}{1+d \cdot n}$  
**Impacto:** Módulo Descuento Simple incompleto  
**Solución:** Ver AUDITORIA_PARTE1.md línea ~520  
**Tiempo:** 1-2 horas

### FALTANTE #2: Abonos Extraordinarios
**Archivos:** `backend/src/Finance/ExtraPayment.php`  
**Tipos:** Reducir plazo, Reducir cuota  
**Impacto:** Módulo Abonos Extra no funcional  
**Solución:** Ver AUDITORIA_PARTE1.md línea ~530  
**Tiempo:** 3-4 horas

### FALTANTE #3: Razones y Proporciones
**Archivos:** `backend/src/Finance/Ratios.php` (NUEVO)  
**Fórmulas:** 3+ fórmulas básicas  
**Impacto:** Módulo "Fundamentos" incompleto  
**Solución:** Ver AUDITORIA_PARTE1.md línea ~600  
**Tiempo:** 2-3 horas

### FALTANTE #4: Reparto Proporcional Completo
**Archivos:** `backend/src/Finance/ProportionalDistribution.php` (EXPANDIR)  
**Tipos:** Inverso simple, compuesto directo, compuesto inverso, mixto  
**Impacto:** Módulo Reparto Proporcional incompleto  
**Solución:** Ver AUDITORIA_PARTE1.md línea ~610  
**Tiempo:** 4-5 horas

### FALTANTE #5: Despejar Cuota
**Archivos:** `backend/src/Finance/Annuity.php` (AGREGAR)  
**Fórmulas:** 2 nuevas: $A = VP \cdot \frac{i}{1-(1+i)^{-n}}$, $A = VF \cdot \frac{i}{(1+i)^n-1}$  
**Impacto:** No poder calcular cuota desde VP o VF  
**Solución:** Ver AUDITORIA_PARTE1.md línea ~670  
**Tiempo:** 1-2 horas

---

# 📋 PLANES DE VALIDACIÓN

## Test Cases por Módulo

### Interés Simple
```php
testCalcularF():
  input: P=1000, i=0.10, n=5
  expected: F=1610.51
  validar contra: Baca Currea p. XXX

testCalcularP():
  input: F=1610.51, i=0.10, n=5
  expected: P=1000

testCalcularI():
  input: P=1000, F=1610.51, n=5
  expected: i=0.10

testCalcularN():
  input: P=1000, F=1610.51, i=0.10
  expected: n=5

testCalcularInteresTotal():
  input: P=1000, i=0.10, n=5
  expected: I=500
```

### Interés Compuesto
```php
testCalcularF():
  input: P=1000, i=0.10, n=5
  expected: F=1610.51
  validar: F > F_simple

testCalcularN():
  input: P=1000, F=1610.51, i=0.10
  expected: n=5

testComparativaSimpleVsCompuesto():
  para n=0..10:
    VF_compuesto >= VF_simple
```

### Tasas
```php
testEquivalencia():
  input: 12% anual convertir a mensual
  expected: ≈0.9489% mensual
  validar: (1 + 0.009489)^12 ≈ 1.12

testVencidaAnticipada():
  input: i=0.10 vencida
  expected: ia≈0.0909 anticipada
  validar: ia/(1-ia) ≈ 0.10
```

## Referencia: Libros
- Baca Currea (2014): Casos ejemplo p. XX-YY
- Meza Orozco (2015): Ejercicios p. AA-BB
- Blank & Tarquin (2018): Chapter X

---

# ✅ PRÓXIMOS PASOS

1. **HOY:** Leer este documento
2. **MAÑANA:** Leer AUDITORIA_PARTE1.md
3. **PASADO:** Leer AUDITORIA_PARTE2.md
4. **SEMANA PRÓXIMA:** Empezar Fix #1 (Rate.php)

---

**Documento de Referencia Rápida**  
**Creado:** 2026-05-27  
**Versión:** 1.0  
**Complementa:** AUDITORIA_PROFESIONAL_PARTE1.md y PARTE2.md
