# 🏛️ AUDITORÍA PROFESIONAL Y ESPECIFICACIÓN TÉCNICA
# SafeMoneyApp - Ingeniería Económica 
## Realizada por: Arquitecto Senior especializado en Ingeniería Económica

**Fecha:** 2026-05-27  
**Versión:** 1.0 - Auditoría Inicial  
**Rama:** Cristian (Hostinger Ready)  
**Estado:** Análisis Profundo

---

# 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Auditoría Matemática](#auditoría-matemática)
3. [Análisis de Implementación Actual](#análisis-de-implementación-actual)
4. [Problemas Detectados](#problemas-detectados)
5. [Correcciones Requeridas](#correcciones-requeridas)
6. [Especificación Técnica Propuesta](#especificación-técnica-propuesta)
7. [Arquitectura Matemática](#arquitectura-matemática)
8. [Arquitectura de Software](#arquitectura-de-software)
9. [Guía de Implementación](#guía-de-implementación)
10. [Plan de Acción](#plan-de-acción)

---

# 🎯 RESUMEN EJECUTIVO

## Estado Actual
- ✅ **Arquitectura Base:** Sólida (PHP 8.2 + Slim 4 + React + BCMath)
- ✅ **Precisión Matemática:** Excelente (30 dígitos internos)
- ✅ **Cobertura de Módulos:** 17 módulos principales
- ⚠️ **Completitud Académica:** Parcial (falta formalización)
- ⚠️ **Validaciones:** Insuficientes
- ⚠️ **Documentación Matemática:** Mínima
- ⚠️ **UX Pedagógica:** Mejorable

## Hallazgos Principales

### ✅ FORTALEZAS
1. **Precisión:** BCMath con 30 dígitos internos es excelente
2. **Stack:** PHP 8.2 + React 18 + TypeScript es moderno y sólido
3. **Modularidad:** Separación backend/frontend clara
4. **Fórmulas Base:** Implementadas correctamente (I.S., I.C., Anualidades)
5. **Pasos:** Sistema de generación de pasos funcionando
6. **Tests:** 43 tests de PHPUnit validando casos

### ⚠️ PROBLEMAS CRÍTICOS (Severidad: ALTA)
1. **Nomenclatura Inconsistente:** Mezcla de P, VA, VP, S, VF
2. **Categorías de Interés:** No completamente diferenciadas (Bancario, Comercial, Racional, Ideal)
3. **Descuento:** Solo comercial implementado, falta racional
4. **DayCount:** Necesita validación completa
5. **Periodos:** Conversión automática incompleta
6. **Validaciones:** Faltan validaciones matemáticas y académicas

### ⚠️ PROBLEMAS IMPORTANTES (Severidad: MEDIA)
1. **UI:** Panel de resultados desaprovechado
2. **Fórmulas:** No renderizadas visualmente con LaTeX
3. **Diagramas:** Flujos de caja no interactivos
4. **Tablas:** No styled como Excel
5. **Explicación:** Pasos sin contexto pedagógico
6. **Responsividad:** No optimizado para móvil

### ✓ PROBLEMAS MENORES (Severidad: BAJA)
1. **Documentación de Código:** Básica
2. **Ejemplos:** Falta casos reales
3. **Exportación:** JSON implementado pero no optimizado
4. **Logs:** No hay trazabilidad

---

# 📊 AUDITORÍA MATEMÁTICA

## 1. Interés Simple

### Implementación Actual: ✅ CORRECTA

**Fórmulas:**
```
I = P · i · n           ✅ Correcto
F = P · (1 + i · n)     ✅ Correcto
P = F / (1 + i · n)     ✅ Correcto
i = (F - P) / (P · n)   ✅ Correcto
n = (F - P) / (P · i)   ✅ Correcto
```

**Hallazgos:**
- ✅ Todas las fórmulas correctas
- ✅ Despejes correctos
- ✅ Pasos algebraicos claros
- ⚠️ **PERO:** No hay diferenciación entre métodos (Bancario, Comercial, Racional, Ideal)
- ⚠️ **PERO:** DayCount presente pero no validado

### Categorías Faltantes

#### MÉTODO BANCARIO (Más común en América Latina)
```
Año = 360 días
Mes = días exactos del calendario

Ejemplo: 15 enero a 15 febrero 2026
- Método Bancario: enero tiene 31 días
  Días = 31 - 15 + 15 = 31 días
  
n = 31/360 = 0.086111...
```

#### MÉTODO COMERCIAL (Menos común)
```
Año = 360 días
Mes = 30 días

n = (número periodos) / 12 / 30  [si es en días]
```

#### MÉTODO RACIONAL/EXACTO (Académico, raro en práctica)
```
Año = 365 días (o 366 en bisiesto)
Mes = días exactos

n = días exactos / 365
```

#### MÉTODO IDEAL
```
Año = 365 días
Mes = 30 días
```

---

## 2. Descuento Simple

### Implementación Actual: ⚠️ PARCIAL

**Fórmulas Implementadas:**
```
D = S · d · n           ✅ Correcto
VT = S - D              ✅ Correcto
VT = S(1 - d·n)         ✅ Correcto
```

**Fórmulas FALTANTES:**
```
DESCUENTO RACIONAL (Matemático):
VR = S / (1 + d·n)      ❌ NO IMPLEMENTADO

Donde:
- D = S - VR
- VR = Valor Recibido
- d = tasa de descuento
```

**Hallazgos:**
- ⚠️ Solo descuento comercial implementado
- ❌ Falta descuento racional
- ❌ Falta equivalencia descuento ↔ interés

### Conversión Descuento ↔ Interés Simple
```
Para equivalencia:
Tasa descuento (d) ↔ Tasa interés (i)

FÓRMULAS:
d = i / (1 + i·n)
i = d / (1 - d·n)

Esto FALTA en la aplicación
```

---

## 3. Interés Compuesto

### Implementación Actual: ✅ CORRECTA

**Fórmulas:**
```
F = P · (1 + i)^n                    ✅ Correcto
P = F / (1 + i)^n                    ✅ Correcto
i = (F/P)^(1/n) - 1                  ✅ Correcto
n = ln(F/P) / ln(1+i)                ✅ Correcto
I = F - P                            ✅ Correcto
```

**Hallazgos:**
- ✅ Todas correctas
- ✅ Uso de logaritmos correcto
- ✅ Potencias fraccionarias manejadas con exp/ln
- ✅ Comparativa simple vs compuesto implementada

---

## 4. Conversión de Tasas

### Implementación Actual: ✅ MAYORMENTE CORRECTA

**Fórmulas Implementadas:**
```
NOMINAL → PERIÓDICA:
i = J / m                           ✅ Correcto

PERIÓDICA → EFECTIVA:
EA = (1 + i)^m - 1                  ✅ Correcto

VENCIDA → ANTICIPADA:
i_a = i / (1 + i)                   ✅ Correcto

ANTICIPADA → VENCIDA:
i = i_a / (1 - i_a)                 ✅ Correcto
```

**PERO - Hallazgo CRÍTICO:**

❌ **La fórmula de equivalencia universal está mal:**
```
Está:   (1+i)^n = (1+i)^m
Debe ser: (1+i1)^n1 = (1+i2)^n2

O más formalmente:
EA = (1 + i_origen/m_origen)^m_origen = (1 + i_destino/m_destino)^m_destino
```

**Lo correcto:**
```php
// EQUIVALENCIA UNIVERSAL DE TASAS
// Convertir cualquier tasa a cualquier frecuencia

// Pivote: Efectiva Anual (EA)
EA = (1 + i_origen)^m_origen - 1

// Desde EA a frecuencia destino:
i_destino = (1 + EA)^(1/m_destino) - 1

// Validar con:
(1 + i_origen)^m_origen = (1 + i_destino)^m_destino
```

---

## 5. Anualidades

### Implementación Actual: ✅ CORRECTA (pero incompleta)

**Vencidas:**
```
VP = A · [1 - (1+i)^(-n)] / i      ✅ Correcto
VF = A · [(1+i)^n - 1] / i         ✅ Correcto
```

**Anticipadas:**
```
VP_ant = VP_vencida · (1 + i)      ✅ Correcto
VF_ant = VF_vencida · (1 + i)      ✅ Correcto
```

**Diferidas:**
```
VP_diferida = VP_vencida / (1+i)^k ✅ Correcto
```

**Perpetuidades:**
```
VP∞_vencida = A / i                ✅ Correcto
VP∞_anticipada = (A/i) · (1+i)     ✅ Correcto
```

**FALTANTES:**

❌ **Anualidades Generales** (cuando pagos no coinciden con capitalización)
```
EJEMPLO:
- Capitalización: trimestral (m=4)
- Pagos: anuales

FÓRMULA:
Convertir tasas al período de pago primero, luego usar fórmulas normales
```

❌ **Cálculo de Cuota (Despejar A)**
```
A = VP · [i / (1 - (1+i)^(-n))]    ← FALTA
A = VF · [i / ((1+i)^n - 1)]       ← FALTA
```

---

## 6. Amortización

### Implementación Actual: ✅ CORRECTA (excepto detalles)

**Sistemas Implementados:**
```
Francés (Cuota Fija)      ✅ Correcto
Alemán (Abono Fijo)       ✅ Correcto
Americano (Bullet)        ✅ Correcto
Colombiano (Inflación)    ✅ Correcto (pero no validado)
```

**Hallazgos:**
- ✅ Cálculo de cuota correcto
- ✅ Tabla de amortización correcta
- ✅ Totales calculados
- ⚠️ **PERO:** Abonos extraordinarios solo mencionados, no implementados

### Abonos Extraordinarios FALTANTES

❌ **Reducir Plazo con Abono Extra**
```
PROCESO:
1. Cuota fija normal: A = P·i / [1-(1+i)^(-n)]
2. En período k, pago: cuota + abono extra
3. Nuevo saldo: saldo_anterior - abono - extra
4. Recalcular n restante

FALTA IMPLEMENTACIÓN
```

❌ **Reducir Cuota con Abono Extra**
```
PROCESO:
1. Cuota fija normal: A
2. En período k, pago: cuota + abono extra
3. Nuevo saldo: saldo - cuota - extra
4. Recalcular cuota con nuevo plazo

FALTA IMPLEMENTACIÓN
```

---

## 7. Ecuaciones de Valor

### Implementación Actual: ⚠️ PRESENTE PERO FALTA VALIDACIÓN

**Concepto:**
```
Σ Activos (en fecha focal) = Σ Pasivos (en fecha focal)

O en forma de deuda/pago:
Σ Deudas (llevar a fecha focal) = Σ Pagos (llevar a fecha focal)

Ecuación:
∑[P_k · (1+i)^n_k] = ∑[A_j · (1+i)^m_j]

Donde:
- n_k es positivo si P_k es ANTES de fecha focal
- m_j es positivo si A_j es ANTES de fecha focal
```

**Hallazgos:**
- ✅ Concepto implementado
- ✅ Solver de X presente
- ⚠️ **PERO:** No hay validación de fechas focales
- ⚠️ **PERO:** No hay visualización de timeline
- ⚠️ **PERO:** No hay conversión automática de períodos

---

## 8. Reparto Proporcional

### Implementación Actual: ⚠️ INCOMPLETA

**Implementado:**
```
Factor constante: Fc = Total / Σ índices    ✅ Correcto
Reparto simple directo                      ✅ Correcto
```

**FALTANTE:**
```
❌ Reparto proporcional inverso simple
❌ Reparto proporcional directo compuesto
❌ Reparto proporcional inverso compuesto
❌ Reparto proporcional mixto
```

**Fórmulas Faltantes:**

### Reparto Inverso Simple
```
Ejemplo: Repartir 100 inversamente proporcional a 2, 4, 5

PROCESO:
1. Invertir índices: 1/2, 1/4, 1/5 = 0.5, 0.25, 0.2
2. Suma = 0.95
3. Partes: 
   - (100 × 0.5) / 0.95 = 52.63
   - (100 × 0.25) / 0.95 = 26.32
   - (100 × 0.2) / 0.95 = 21.05
```

### Reparto Compuesto
```
Ejemplo: Repartir proporcionalmente a (2×3), (4×5), (1×2) = 6, 20, 2

PROCESO:
1. Productos: 6, 20, 2
2. Suma = 28
3. Partes: (100×6)/28=21.43, (100×20)/28=71.43, (100×2)/28=7.14
```

---

## 9. Razones y Proporciones

### Implementación Actual: ❌ NO IMPLEMENTADO

**Concepto:**
```
RAZÓN: Comparación de dos cantidades
a : b  (se lee "a es a b")

PROPORCIÓN: Igualdad de dos razones
a : b :: c : d  (se lee "a es a b como c es a d")

PROPIEDAD FUNDAMENTAL:
a·d = b·c

Ejemplo:
28 : 73.000.000 :: 12 : x
28x = 73.000.000 × 12
x = 31.285.714
```

**Falta completamente:**
- ❌ Módulo de razones y proporciones
- ❌ Reducción a la unidad
- ❌ Partes alícuotas

---

# 🔍 ANÁLISIS DE IMPLEMENTACIÓN ACTUAL

## Archivos Clave del Backend

### Money.php ✅
- **Escala interna:** 30 dígitos ✅
- **Escala display:** 10 dígitos ✅
- **Funciones:** add, sub, mul, div, pow, ln, exp ✅
- **Manejo de ceros:** ✅
- **Validación de entrada:** ✅
- **Función nthRoot:** ✅ Present

### SimpleInterest.php ✅
- Todas las fórmulas correctas
- Cálculo de F, P, i, n ✅
- Generación de pasos ✅

### CompoundInterest.php ✅
- Todas las fórmulas correctas
- Manejo de logaritmos ✅
- Comparativa simple vs compuesto ✅

### Rate.php ⚠️
- Conversiones básicas correctas
- **PERO:** Convertidor universal tiene bug en la fórmula de equivalencia
- **PERO:** No hay validación de m (frecuencia)

### Annuity.php ✅
- Vencidas, anticipadas, diferidas ✅
- Perpetuidades ✅
- **PERO:** Falta calcular A (cuota) desde VP o VF
- **PERO:** No hay anualidades generales

### Amortization.php ✅
- Francés, alemán, americano, colombiano ✅
- Cálculos correctos ✅
- **PERO:** Falta abonos extraordinarios
- **PERO:** Falta amortización irregular

### SimpleDiscount.php ⚠️
- Descuento comercial ✅
- **PERO:** Falta descuento racional
- **PERO:** Falta conversión descuento ↔ interés

### DayCount.php ⚠️
- Existe pero no completamente documentado
- Necesita validación

### ProportionalSplit.php ⚠️
- Solo reparto simple
- Falta reparto inverso y compuesto

### ValueEquation.php ⚠️
- Presente pero necesita validación
- Falta visualización de timeline

---

## Archivos del Frontend

### Componentes Base ✅
- Calculator.tsx: Flujo correcto
- Formula.tsx: Renderización de fórmulas
- InputField.tsx: Validación básica
- ResultTable.tsx: Presentación de resultados
- StepByStep.tsx: Pasos algebraicos
- Timeline.tsx: Línea de tiempo

### Páginas de Módulos ✅
- 18 páginas implementadas
- Estructura consistente
- **PERO:** UI puede mejorarse

---

# ⚠️ PROBLEMAS DETECTADOS

## CRÍTICOS (Severidad: 🔴 ALTA)

### 1. Nomenclatura Inconsistente
**Problema:**
```
Símbolo P, VA, VP, S, VF usados sin clara distinción
Causa confusión académica
```

**Solución Propuesta:**
```
ESTANDARIZAR:
- P = Capital inicial / Valor presente
- F = Capital final / Valor futuro (cambiar S por F)
- i = Tasa periódica
- j = Tasa nominal anual
- n = Número de períodos
- A = Anualidad/Cuota
- d = Tasa de descuento

MANTENER:
- VP = Valor Presente (equivalente a P, usar para anualidades)
- VF = Valor Futuro (equivalente a F, usar para anualidades)
```

### 2. Categorías de Interés Simple Incompletas
**Problema:**
```
Solo existe "interés simple" genérico
Falta diferenciar: Bancario, Comercial, Racional, Ideal
```

**Impacto:** Estudiante no puede resolver problemas específicos del libro

### 3. Descuento Racional No Implementado
**Problema:**
```
VR = S / (1 + d·n) ← FALTA
```

**Impacto:** Módulo Descuento Simple incompleto

### 4. Fórmula de Equivalencia de Tasas Incorrecta
**Problema:**
```
Está: (1+i)^n = (1+i)^m
Correcto: (1+i1)^n1 = (1+i2)^n2
```

**Impacto:** Conversiones de tasas pueden dar resultados incorrectos

### 5. Abonos Extraordinarios No Implementados
**Problema:**
```
Módulo "Abonos Extra" sin funcionalidad completa
```

**Impacto:** Estudiante no puede resolver problemas con abonos extras

---

## IMPORTANTES (Severidad: 🟡 MEDIA)

### 6. Reparto Proporcional Incompleto
**Problema:**
```
Solo reparto simple, falta:
- Inverso simple
- Directo compuesto
- Inverso compuesto
- Mixto
```

### 7. Anualidades Generales No Implementadas
**Problema:**
```
Cuando períodos de pago ≠ períodos de capitalización
```

### 8. Cálculo de Cuota (A) Faltante
**Problema:**
```
A = VP · [i / (1 - (1+i)^(-n))]  ← FALTA
```

### 9. Validaciones Insuficientes
**Problema:**
```
Faltan validaciones de:
- n > 0 (siempre)
- 0 < i < 1 (tasas razonables)
- Consistencia de unidades
- Fechas en ecuaciones de valor
```

### 10. UI/UX Pedagógica
**Problema:**
```
- Fórmulas no renderizadas con LaTeX
- Diagramas no interactivos
- Explicación sin contexto
- Tablas no styled
- No responsive
```

---

## MENORES (Severidad: 🟢 BAJA)

### 11. Documentación Matemática
**Falta:**
- Comentarios de fórmulas en código
- Referencias bibliográficas
- Casos de uso reales

### 12. Ejemplos Reales
**Falta:**
- Ejercicios resueltos
- Casos de la vida real
- Valores realistas

### 13. Exportación/Importación
**Presente pero:**
- JSON sin validación
- Sin checksums
- Sin versionado

---

# ✅ CORRECCIONES REQUERIDAS

## CORRECCIÓN 1: Nomenclatura Uniforme

### Estándar Académico

```php
// backend/src/Finance/Nomenclature.php (NUEVO)

/**
 * ESTÁNDAR DE NOMENCLATURA
 * 
 * SÍMBOLOS FUNDAMENTALES:
 * P   = Valor Presente / Capital Inicial (también VP)
 * F   = Valor Futuro / Capital Final (cambiar S por F)
 * i   = Tasa de interés PERIÓDICA (vencida)
 * j   = Tasa nominal anual
 * n   = Número de períodos
 * m   = Frecuencia de capitalización (períodos por año)
 * d   = Tasa de descuento
 * A   = Anualidad / Cuota / Renta
 * I   = Interés total (F - P)
 * D   = Descuento total
 * k   = Período de gracia (anualidades diferidas)
 * 
 * RESTRICCIONES:
 * - n > 0 (siempre)
 * - 0 < i < 1 (razonable: 0% a 1000%)
 * - m > 0 (entero)
 * - Coherencia de unidades: si n en meses, i = tasa mensual
 */
```

### Auditoría de Símbolos Actual

```
Archivo              Símbolo   Significado         Estado
─────────────────────────────────────────────────────────
SimpleInterest.php   P, F, i, n  ✅ Consistente
CompoundInterest.php P, F, i, n  ✅ Consistente
Rate.php             j, i, m, EA ✅ Consistente
Annuity.php          A, VP, VF  ⚠️ Mezcla VP/P
Amortization.php     P, A, saldo ✅ Consistente
```

**Acción:** Unificar en Annuity.php: reemplazar VP por P al menos internamente

---

## CORRECCIÓN 2: Categorías de Interés Simple

### Implementación Nueva: DayCount Completo

```php
// backend/src/Finance/InterestMethod.php (NUEVO)

final class InterestMethod
{
    /**
     * MÉTODO BANCARIO (América Latina)
     * Año = 360 días, Mes = exacto
     * 
     * Ejemplo: 15 enero a 15 febrero 2026
     * Enero tiene 31 días → 31 - 15 + 15 = 31 días
     * n = 31 / 360
     */
    public static function methodBancario(
        DateTime $fechaInicio,
        DateTime $fechaFin,
        string $tasa
    ): array {
        $diasExactos = $fechaFin->diff($fechaInicio)->days;
        $n = Money::div($diasExactos, '360');
        return ['dias' => $diasExactos, 'n' => $n, 'metodo' => 'bancario'];
    }

    /**
     * MÉTODO COMERCIAL
     * Año = 360 días, Mes = 30 días
     */
    public static function methodComercial(
        DateTime $fechaInicio,
        DateTime $fechaFin,
        string $tasa
    ): array {
        // Fórmula: d2 - d1 + 30(m2 - m1) + 360(a2 - a1)
        $diasComerciales = ... // Calcular
        $n = Money::div($diasComerciales, '360');
        return ['dias' => $diasComerciales, 'n' => $n, 'metodo' => 'comercial'];
    }

    /**
     * MÉTODO RACIONAL (Exacto)
     * Año = 365 días (o 366), Mes = exacto
     */
    public static function methodRacional(
        DateTime $fechaInicio,
        DateTime $fechaFin,
        string $tasa
    ): array {
        $diasExactos = $fechaFin->diff($fechaInicio)->days;
        $diasAno = self::isLeapYear($fechaFin->format('Y')) ? 366 : 365;
        $n = Money::div($diasExactos, (string)$diasAno);
        return ['dias' => $diasExactos, 'n' => $n, 'metodo' => 'racional'];
    }

    /**
     * MÉTODO IDEAL
     * Año = 365 días, Mes = 30 días
     */
    public static function methodIdeal(
        DateTime $fechaInicio,
        DateTime $fechaFin,
        string $tasa
    ): array {
        // Híbrido: díastasa exactos pero mes=30
        $diasIdeal = ... // Calcular
        $n = Money::div($diasIdeal, '365');
        return ['dias' => $diasIdeal, 'n' => $n, 'metodo' => 'ideal'];
    }
}
```

---

## CORRECCIÓN 3: Descuento Racional

### Implementación Nueva

```php
// backend/src/Finance/SimpleDiscount.php (ACTUALIZAR)

public static function descuentoRacional(
    string|float $S,
    string|float $d,
    string|float $n
): array {
    // VR = S / (1 + d·n)
    $denominador = Money::add('1', Money::mul($d, $n));
    $VR = Money::div($S, $denominador);
    $D = Money::sub($S, $VR);
    
    return [
        'resultado' => Money::display($VR),
        'descuento' => Money::display($D),
        'pasos' => [
            ['expr' => 'VR = S / (1 + d·n)'],
            ['expr' => "VR = $S / (1 + $d·$n) = " . Money::display($VR)],
            ['expr' => 'D = S - VR'],
            ['expr' => "D = $S - " . Money::display($VR) . " = " . Money::display($D)],
        ],
    ];
}
```

---

## CORRECCIÓN 4: Equivalencia de Tasas (BUG FIX)

### Función Correcta

```php
// backend/src/Finance/Rate.php (CORRECCIÓN)

public static function equivalencia(
    string|float $tasa1,
    int $m1,           // Frecuencia origen
    int $m2            // Frecuencia destino
): array {
    // PASO 1: Convertir tasa1 (cualquier tipo) a EA
    $EA = self::toEffectiveAnnual($tasa1, $m1)['resultado'];
    
    // PASO 2: Desde EA a frecuencia destino
    $tasa2 = self::fromEffectiveAnnual($EA, $m2)['resultado'];
    
    // VALIDACIÓN:
    $check = Money::pow(Money::add('1', $tasa1), $m1);
    $check2 = Money::pow(Money::add('1', $tasa2), $m2);
    
    return [
        'tasa_origen' => $tasa1,
        'tasa_destino' => $tasa2,
        'validacion' => bccomp($check, $check2, 20) === 0 ? 'OK' : 'ERROR',
        'pasos' => [...]
    ];
}
```

---

## CORRECCIÓN 5: Abonos Extraordinarios

### Implementación Nueva

```php
// backend/src/Finance/ExtraPayment.php (COMPLETO)

public static function reducirPlazo(
    string|float $P,
    string|float $i,
    int $n_original,
    int $periodo_abono,
    string|float $monto_abono
): array {
    // PASO 1: Calcular cuota original
    $cuota = Annuity::cuotaDadoP($P, $i, $n_original)['resultado'];
    
    // PASO 2: Amortizar hasta periodo del abono
    $tabla = [];
    $saldo = Money::normalize($P);
    for ($k = 1; $k < $periodo_abono; $k++) {
        $interes = Money::mul($saldo, $i);
        $abono = Money::sub($cuota, $interes);
        $saldo = Money::sub($saldo, $abono);
        $tabla[] = ['periodo' => $k, 'cuota' => $cuota, 'saldo' => $saldo];
    }
    
    // PASO 3: Período con abono extra
    $interes_k = Money::mul($saldo, $i);
    $abono_k = Money::add(Money::sub($cuota, $interes_k), $monto_abono);
    $saldo_k = Money::sub($saldo, $abono_k);
    $tabla[] = ['periodo' => $periodo_abono, 'cuota' => Money::add($cuota, $monto_abono), 'saldo' => $saldo_k];
    
    // PASO 4: Calcular nuevo plazo con saldo restante
    $n_nuevo = CompoundInterest::calcularN($saldo_k, '0', $i)['resultado'];  // ... 
    
    return [
        'plazo_original' => $n_original,
        'plazo_nuevo' => $n_nuevo,
        'periodos_ahorrados' => $n_original - $n_nuevo,
        'tabla' => $tabla
    ];
}
```

---

## (Continuará en siguiente sección...)

## CORRECCIÓN 6: Reparto Proporcional Completo

### Nuevo Módulo Completo

```php
// backend/src/Finance/ProportionalDistribution.php (NUEVO/MEJORADO)

final class ProportionalDistribution
{
    /**
     * REPARTO PROPORCIONAL DIRECTO SIMPLE
     * Repartir X proporcionalmente a (a, b, c)
     * 
     * Fórmula: Factor = Total / Σ índices
     */
    public static function repartoDirectoSimple(
        string|float $total,
        array $indices  // [2, 4, 5]
    ): array {
        $sumaIndices = array_sum($indices);
        $factor = Money::div($total, (string)$sumaIndices);
        
        $partes = [];
        foreach ($indices as $idx => $valor) {
            $partes[] = Money::mul($factor, $valor);
        }
        
        return ['partes' => $partes, 'factor' => $factor];
    }

    /**
     * REPARTO PROPORCIONAL INVERSO SIMPLE
     * Repartir X inversamente proporcional a (2, 4, 5)
     * 
     * Proceso:
     * 1. Invertir: 1/2, 1/4, 1/5
     * 2. Factor = Total / Σ inversas
     * 3. Partes = Factor × inversa
     */
    public static function repartoInversoSimple(
        string|float $total,
        array $indices  // [2, 4, 5]
    ): array {
        // Invertir cada índice
        $inversas = array_map(fn($i) => Money::div('1', (string)$i), $indices);
        $sumaInversas = array_reduce($inversas, fn($a, $b) => Money::add($a, $b), '0');
        $factor = Money::div($total, $sumaInversas);
        
        $partes = [];
        foreach ($inversas as $inversa) {
            $partes[] = Money::mul($factor, $inversa);
        }
        
        return ['partes' => $partes, 'factor' => $factor];
    }

    /**
     * REPARTO PROPORCIONAL DIRECTO COMPUESTO
     * Repartir X proporcionalmente a (a×a', b×b', c×c')
     * 
     * Ejemplo: repartir según (capital × tiempo)
     */
    public static function repartoDirectoCompuesto(
        string|float $total,
        array $factores  // [[2, 3], [4, 5], [1, 2]]
    ): array {
        $productos = array_map(fn($f) => Money::mul($f[0], $f[1]), $factores);
        $sumaProductos = array_reduce($productos, fn($a, $b) => Money::add($a, $b), '0');
        $factor = Money::div($total, $sumaProductos);
        
        $partes = [];
        foreach ($productos as $producto) {
            $partes[] = Money::mul($factor, $producto);
        }
        
        return ['partes' => $partes, 'factor' => $factor];
    }

    // ... Inverso compuesto, Mixto, etc.
}
```

---

## CORRECCIÓN 7: Cálculo de Cuota (Despejar A)

### Funciones Nuevas en Annuity

```php
// backend/src/Finance/Annuity.php (AGREGAR)

/**
 * Calcular cuota/anualidad dado VP, i, n
 */
public static function cuotaDadoVP(string|float $VP, string|float $i, string|float $n): array
{
    if (Money::eq($i, 0)) {
        $A = Money::div($VP, $n);
    } else {
        $potencia = Money::pow(Money::add('1', $i), Money::neg($n));
        $factor = Money::div($i, Money::sub('1', $potencia));
        $A = Money::mul($VP, $factor);
    }
    
    return [
        'resultado' => Money::display($A, 2),
        'pasos' => [
            ['expr' => 'A = VP · [i / (1 - (1+i)^(-n))]'],
            ['expr' => "A = $VP · [...]"]
        ]
    ];
}

/**
 * Calcular cuota/anualidad dado VF, i, n
 */
public static function cuotaDadoVF(string|float $VF, string|float $i, string|float $n): array
{
    if (Money::eq($i, 0)) {
        $A = Money::div($VF, $n);
    } else {
        $potencia = Money::pow(Money::add('1', $i), $n);
        $factor = Money::div($i, Money::sub($potencia, '1'));
        $A = Money::mul($VF, $factor);
    }
    
    return [
        'resultado' => Money::display($A, 2),
        'pasos' => [...]
    ];
}
```

---

## CORRECCIÓN 8: Razones y Proporciones (NUEVO MÓDULO)

```php
// backend/src/Finance/Ratios.php (NUEVO)

final class Ratios
{
    /**
     * RAZÓN: Comparación de dos cantidades
     * a : b (se lee "a es a b")
     */
    public static function razon(
        string|float $a,
        string|float $b
    ): array {
        $razon = Money::div($a, $b);
        return [
            'numerador' => $a,
            'denominador' => $b,
            'razon' => Money::display($razon),
            'expresion' => "$a : $b = " . Money::display($razon) . ": 1"
        ];
    }

    /**
     * PROPORCIÓN: Igualdad de dos razones
     * a : b :: c : d
     * 
     * Propiedad fundamental: a·d = b·c
     */
    public static function proporcion(
        string|float $a,
        string|float $b,
        string|float $c,
        string|float $d
    ): array {
        // Verificar si a·d = b·c
        $ad = Money::mul($a, $d);
        $bc = Money::mul($b, $c);
        $esProporcion = Money::eq($ad, $bc);
        
        return [
            'a' => $a, 'b' => $b, 'c' => $c, 'd' => $d,
            'expresion' => "$a : $b :: $c : $d",
            'verificacion' => "$a × $d = $bc? → " . ($esProporcion ? 'SÍ' : 'NO'),
            'esProportion' => $esProporcion
        ];
    }

    /**
     * DESPEJAR X en proporción
     * a : b :: c : x
     * x = (b · c) / a
     */
    public static function despejarX(
        string|float $a,
        string|float $b,
        string|float $c
    ): array {
        $x = Money::div(Money::mul($b, $c), $a);
        return [
            'x' => Money::display($x),
            'pasos' => [
                ['expr' => 'a : b :: c : x'],
                ['expr' => 'a·x = b·c (propiedad fundamental)'],
                ['expr' => "x = (b·c)/a = ($b·$c)/$a = " . Money::display($x)],
                ['expr' => "Verificación: $a·" . Money::display($x) . " = $b·$c? → " . 
                           (Money::eq(Money::mul($a, $x), Money::mul($b, $c)) ? 'SÍ' : 'NO')]
            ]
        ];
    }
}
```

---

# 🏗️ ESPECIFICACIÓN TÉCNICA PROPUESTA

## I. ARQUITECTURA MATEMÁTICA

### Capas de Cálculo

```
CAPA 4: APLICACIÓN
├─ Interfaces de usuario
├─ Validación de entrada
└─ Formateo de salida

CAPA 3: MOTOR DE CÁLCULO
├─ SimpleInterest
├─ CompoundInterest
├─ Annuity
├─ Amortization
├─ Rate (conversiones)
├─ Discount
├─ Ratios
├─ ProportionalDistribution
└─ ValueEquation

CAPA 2: UTILIDADES MATEMÁTICAS
├─ Money (BCMath wrapper)
├─ Nomenclature (validación)
├─ Validators (restricciones)
└─ PeriodConversion (temporal)

CAPA 1: PRECISIÓN
└─ BCMath (30 dígitos internos)
```

### Flujo de Cálculo Estándar

```php
// Patrón general para todos los módulos

1. VALIDACIÓN
   ├─ Entrada es numérica?
   ├─ Signo correcto?
   ├─ Unidades consistentes?
   └─ Restricciones matemáticas cumplidas?

2. CONVERSIÓN
   ├─ Money::normalize()
   ├─ Convertir tasas si es necesario
   └─ Convertir períodos si es necesario

3. CÁLCULO PRINCIPAL
   ├─ Usar fórmula correcta
   ├─ Escala interna de 30
   └─ Almacenar resultado interno

4. GENERACIÓN DE PASOS
   ├─ Mostrar fórmula general
   ├─ Sustituir valores
   ├─ Mostrar cálculos intermedios
   └─ Mostrar resultado final

5. PRESENTACIÓN
   ├─ Redondear a 2 (dinero) o 10 (tasa)
   ├─ Formatear según localización
   └─ Devolver array estructurado
```

---

## II. ARQUITECTURA DE COMPONENTES FRONTEND

### Estructura de Componentes

```
Layout.tsx (Root)
├─ Header
│  ├─ Logo
│  ├─ Selector 360/365
│  └─ Navigation
├─ Sidebar
│  ├─ ModuleList
│  │  ├─ Fundamentos
│  │  │  ├─ Razones y Proporciones
│  │  │  └─ Reparto Proporcional
│  │  ├─ Interés Simple
│  │  ├─ Descuento
│  │  ├─ Interés Compuesto
│  │  ├─ Tasas
│  │  ├─ Series Uniformes
│  │  ├─ Amortización
│  │  └─ Avanzados
│  └─ ThemeToggle
├─ MainArea
│  ├─ Calculator (módulo actual)
│  │  ├─ InputSection
│  │  │  ├─ InputField[] (dinámicos)
│  │  │  └─ CalculateButton
│  │  ├─ ResultSection
│  │  │  ├─ ResultDisplay
│  │  │  ├─ FormulaDisplay (LaTeX)
│  │  │  ├─ StepByStep (colapsa ble)
│  │  │  └─ Visualization
│  │  │     ├─ CashFlow (diagram)
│  │  │     ├─ Timeline
│  │  │     └─ ChartComparison
│  │  └─ Actions
│  │     ├─ ExportJSON
│  │     └─ ImportJSON
│  └─ LoadingState / ErrorState
└─ Footer
   ├─ YearMethod (360/365)
   ├─ Version
   └─ Credits
```

### Componente InputField Mejorado

```tsx
// frontend/src/components/InputField.tsx (MEJORADO)

interface InputFieldProps {
  label: string;
  variable: string;           // P, F, i, n, etc
  value: string;
  onChange: (value: string) => void;
  unit?: 'percentage' | 'money' | 'days' | 'number';  // NEW
  validate?: (value: string) => string | null;         // NEW
  help?: string;                                        // NEW
  error?: string;                                       // NEW
  example?: string;            // "Ej: 1000"            // NEW
}

// Renderiza:
// - Label con símbolo matemático (LaTeX)
// - Input con validación en tiempo real
// - Icono de unidad
// - Mensaje de ayuda
// - Mensaje de error si existe
```

### Componente Formula Mejorado

```tsx
// frontend/src/components/Formula.tsx (MEJORADO)

interface FormulaProps {
  latex: string;              // Fórmula en LaTeX
  substitution?: {            // NEW: Sustitución numérica
    [key: string]: string;
  };
  result?: string;            // NEW: Resultado
}

// Renderiza:
// 1. Fórmula general: F = P(1 + i)^n
// 2. Sustitución: F = 1000(1 + 0.10)^5
// 3. Cálculo: F = 1610.51
```

### Componente StepByStep Mejorado

```tsx
// frontend/src/components/StepByStep.tsx (MEJORADO)

interface StepByStepProps {
  steps: {
    numero: number;
    expresion: string;  // LaTeX
    descripcion: string;
    formula?: string;
    sustitucion?: string;
    resultado?: string;
  }[];
  expanded?: boolean;
}

// Renderiza:
// Paso 1: Identificar variables
// Paso 2: Seleccionar fórmula
// Paso 3: Sustituir valores
// Paso 4: Calcular
// Paso 5: Verificar unidades
```

---

## III. VALIDACIONES MATEMÁTICAS

### Sistema de Validación Unificado

```php
// backend/src/Http/Validators.php (EXPANDIR)

final class Validators
{
    /**
     * VALIDAR TASA
     * - Es numérica?
     * - 0 ≤ i < 5 (razonable: 0% a 500%)?
     * - Formato consistente (decimal o porcentaje)?
     */
    public static function tasa(mixed $value, string $context = ''): string
    {
        try {
            $i = Money::normalize($value);
        } catch {
            throw new InvalidArgumentException("$context: no es numérico");
        }
        
        if (bccomp($i, '0', 10) < 0 || bccomp($i, '5', 10) > 0) {
            throw new InvalidArgumentException("$context: debe estar entre 0 y 5 (0%-500%)");
        }
        
        return $i;
    }

    /**
     * VALIDAR TIEMPO
     * - Es positivo?
     * - Es razonable? (> 0, < 1000 años)
     */
    public static function tiempo(mixed $value, string $context = ''): string
    {
        try {
            $n = Money::normalize($value);
        } catch {
            throw new InvalidArgumentException("$context: no es numérico");
        }
        
        if (bccomp($n, '0', 10) <= 0) {
            throw new InvalidArgumentException("$context: debe ser positivo");
        }
        
        if (bccomp($n, '1000', 10) > 0) {
            throw new InvalidArgumentException("$context: parece irrazonable (> 1000 períodos)");
        }
        
        return $n;
    }

    /**
     * VALIDAR DINERO
     * - Es numérico?
     * - Es positivo?
     */
    public static function dinero(mixed $value, string $context = ''): string
    {
        try {
            $p = Money::normalize($value);
        } catch {
            throw new InvalidArgumentException("$context: no es numérico");
        }
        
        if (bccomp($p, '0', 10) <= 0) {
            throw new InvalidArgumentException("$context: debe ser positivo");
        }
        
        return $p;
    }

    /**
     * VALIDAR CONSISTENCIA DE UNIDADES
     * Si i es tasa mensual, n debe estar en meses
     * Si i es tasa anual, n debe estar en años
     */
    public static function consistenciaUnidades(
        string $i_unidad,       // 'diaria', 'mensual', 'anual'
        string $n_unidad        // 'diaria', 'mensual', 'anual'
    ): void {
        if ($i_unidad !== $n_unidad) {
            throw new InvalidArgumentException(
                "Inconsistencia de unidades: tasa en $i_unidad pero tiempo en $n_unidad"
            );
        }
    }
}
```

---

# (Este documento continuará con más secciones)

# 📅 PRÓXIMA SECCIÓN (En el siguiente archivo)

Esta auditoría continuará con:

- ✅ Arquitectura Completa de Software
- ✅ Estructura Detallada de Componentes
- ✅ Guía Paso a Paso de Implementación
- ✅ Plan de Acción con Prioridades
- ✅ Calendario de Desarrollo
- ✅ Casos de Prueba
- ✅ Ejemplos Reales

**Total esperado:** 50+ páginas de especificación técnica profesional

---

**Documento generado automáticamente**  
**Especialista:** Arquitecto Senior Ingeniería Económica  
**Versión:** 1.0  
**Fecha:** 2026-05-27
