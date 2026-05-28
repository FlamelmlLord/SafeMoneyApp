<?php

namespace App\Finance;

use InvalidArgumentException;

/**
 * Cálculos de Razones y Proporciones
 * 
 * Una razón es la relación entre dos cantidades: a:b o a/b
 * Una proporción es una igualdad entre dos razones: a/b = c/d
 */
class RazonesProporciones
{
    private const SCALE = 10; // Escala para bcmath

    /**
     * Calcula una razón simple (a:b)
     * @param string|int|float $a Primera cantidad
     * @param string|int|float $b Segunda cantidad
     * @return array
     */
    public static function razonSimple($a, $b): array
    {
        $a = Money::normalize($a);
        $b = Money::normalize($b);
        
        if ($b === '0') {
            throw new InvalidArgumentException('El divisor no puede ser cero');
        }
        
        $razon = bcdiv($a, $b, self::SCALE);
        
        return [
            'a' => $a,
            'b' => $b,
            'razon' => $razon,
            'razonFormato' => "$a : $b",
            'valor' => $razon,
        ];
    }

    /**
     * Calcula la cuarta proporcional: si a/b = c/x, encuentra x
     * x = (b * c) / a
     * 
     * @param string|int|float $a Primera cantidad de la razón conocida
     * @param string|int|float $b Segunda cantidad de la razón conocida
     * @param string|int|float $c Primer término de la proporción
     * @return array
     */
    public static function cuartaProporcional($a, $b, $c): array
    {
        $a = Money::normalize($a);
        $b = Money::normalize($b);
        $c = Money::normalize($c);
        
        if ($a === '0') {
            throw new InvalidArgumentException('El divisor no puede ser cero');
        }
        
        // x = (b * c) / a
        $numerador = bcmul($b, $c, self::SCALE);
        $x = bcdiv($numerador, $a, self::SCALE);
        
        // Verificación
        $razonIzq = bcdiv($a, $b, self::SCALE);
        $razonDer = bcdiv($c, $x, self::SCALE);
        $sonIguales = abs((float) $razonIzq - (float) $razonDer) < 0.0001;
        
        return [
            'a' => $a,
            'b' => $b,
            'c' => $c,
            'x' => $x,
            'proporcion' => "$a:$b :: $c:$x",
            'razonIzquierda' => $razonIzq,
            'razonDerecha' => $razonDer,
            'sonIguales' => $sonIguales,
            'verificacion' => $sonIguales ? 'Proporción válida' : 'Proporción inválida',
        ];
    }

    /**
     * Calcula C en una proporción: si a/b = c/x, encuentra c
     * c = (a * x) / b
     * 
     * @param string|int|float $a Primera cantidad de la razón conocida
     * @param string|int|float $b Segunda cantidad de la razón conocida
     * @param string|int|float $x Segunda cantidad de la proporción
     * @return array
     */
    public static function calcularC($a, $b, $x): array
    {
        $a = Money::normalize($a);
        $b = Money::normalize($b);
        $x = Money::normalize($x);
        
        if ($b === '0') {
            throw new InvalidArgumentException('El divisor no puede ser cero');
        }
        
        // c = (a * x) / b
        $numerador = bcmul($a, $x, self::SCALE);
        $c = bcdiv($numerador, $b, self::SCALE);
        
        // Verificación
        $razonIzq = bcdiv($a, $b, self::SCALE);
        $razonDer = bcdiv($c, $x, self::SCALE);
        $sonIguales = abs((float) $razonIzq - (float) $razonDer) < 0.0001;
        
        return [
            'a' => $a,
            'b' => $b,
            'c' => $c,
            'x' => $x,
            'proporcion' => "$a:$b :: $c:$x",
            'razonIzquierda' => $razonIzq,
            'razonDerecha' => $razonDer,
            'sonIguales' => $sonIguales,
            'verificacion' => $sonIguales ? 'Proporción válida' : 'Proporción inválida',
        ];
    }

    /**
     * Divide una cantidad en partes proporcionales a unos índices
     * Ej: dividir 1000 en partes proporcionales a 2:3:5
     * 
     * @param string|int|float $monto Monto total a dividir
     * @param array $indices Índices de proporcionalidad
     * @return array
     */
    public static function divisionProporcional($monto, array $indices): array
    {
        $monto = Money::normalize($monto);
        
        if (empty($indices)) {
            throw new InvalidArgumentException('Debe proporcionar al menos un índice');
        }
        
        // Suma de todos los índices
        $sumaIndices = '0';
        foreach ($indices as $idx) {
            $idx = Money::normalize($idx);
            $sumaIndices = bcadd($sumaIndices, $idx, self::SCALE);
        }
        
        if ($sumaIndices === '0') {
            throw new InvalidArgumentException('La suma de índices no puede ser cero');
        }
        
        // Calcula cada parte
        $partes = [];
        $sumaPartes = '0';
        foreach ($indices as $idx) {
            $idx = Money::normalize($idx);
            $razon = bcdiv($idx, $sumaIndices, self::SCALE);
            $parte = bcmul($monto, $razon, self::SCALE);
            $partes[] = [
                'indice' => $idx,
                'razon' => $razon,
                'parte' => $parte,
            ];
            $sumaPartes = bcadd($sumaPartes, $parte, self::SCALE);
        }
        
        return [
            'monto' => $monto,
            'indices' => $indices,
            'sumaIndices' => $sumaIndices,
            'partes' => $partes,
            'sumaPartes' => $sumaPartes,
            'cuadra' => bccomp($monto, $sumaPartes, 2) === 0,
        ];
    }

    /**
     * Calcula el término desconocido en una proporción compuesta
     * a/b * c/d = e/x, encuentra x
     * 
     * @param string|int|float $a
     * @param string|int|float $b
     * @param string|int|float $c
     * @param string|int|float $d
     * @param string|int|float $e
     * @return array
     */
    public static function proporcionCompuesta($a, $b, $c, $d, $e): array
    {
        $a = Money::normalize($a);
        $b = Money::normalize($b);
        $c = Money::normalize($c);
        $d = Money::normalize($d);
        $e = Money::normalize($e);
        
        // (a/b) * (c/d) = e/x
        // x = (e * b * d) / (a * c)
        
        $numerador = bcmul(bcmul($e, $b, self::SCALE), $d, self::SCALE);
        $denominador = bcmul($a, $c, self::SCALE);
        
        if ($denominador === '0') {
            throw new InvalidArgumentException('El denominador no puede ser cero');
        }
        
        $x = bcdiv($numerador, $denominador, self::SCALE);
        
        return [
            'a' => $a,
            'b' => $b,
            'c' => $c,
            'd' => $d,
            'e' => $e,
            'x' => $x,
            'proporcion' => "($a/$b) * ($c/$d) = $e/$x",
        ];
    }
}

