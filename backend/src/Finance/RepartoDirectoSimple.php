<?php

namespace App\Finance;

use InvalidArgumentException;

class RepartoDirectoSimple
{
    private const SCALE = 10;

    /**
     * Reparto proporcional directo simple
     *
     * Métodos:
     * - proporciones
     * - reduccion
     * - alicuotas
     */
    public static function calcular(
        $monto,
        array $partes,
        string $metodo = 'alicuotas'
    ): array {

        $monto = Money::normalize($monto);

        if ($monto === '0') {
            throw new InvalidArgumentException(
                'El monto debe ser mayor a cero'
            );
        }

        if (empty($partes)) {
            throw new InvalidArgumentException(
                'Debe ingresar al menos una parte'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Sumar índices
        |--------------------------------------------------------------------------
        */

        $sumaIndices = '0';

        foreach ($partes as $parte) {

            $peso = Money::normalize(
                $parte['peso'] ?? 0
            );

            if ($peso === '0') {
                throw new InvalidArgumentException(
                    'Todos los índices deben ser mayores a cero'
                );
            }

            $sumaIndices = bcadd(
                $sumaIndices,
                $peso,
                self::SCALE
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Factor constante
        |--------------------------------------------------------------------------
        */

        $fc = bcdiv(
            $monto,
            $sumaIndices,
            self::SCALE
        );

        /*
        |--------------------------------------------------------------------------
        | Calcular partes
        |--------------------------------------------------------------------------
        */

        $resultado = [];

        $sumaPartes = '0';

        foreach ($partes as $idx => $parte) {

            $nombre = $parte['nombre']
                ?? ('Parte ' . ($idx + 1));

            $peso = Money::normalize(
                $parte['peso']
            );

            /*
            |--------------------------------------------------------------------------
            | Fracción
            |--------------------------------------------------------------------------
            */

            $fraccion = bcdiv(
                $peso,
                $sumaIndices,
                self::SCALE
            );

            /*
            |--------------------------------------------------------------------------
            | Valor de la parte
            |--------------------------------------------------------------------------
            */

            $valorParte = bcmul(
                $monto,
                $fraccion,
                self::SCALE
            );

            $valorParte = number_format(
                (float) $valorParte,
                2,
                '.',
                ''
            );

            /*
            |--------------------------------------------------------------------------
            | Acumular
            |--------------------------------------------------------------------------
            */

            $sumaPartes = bcadd(
                $sumaPartes,
                $valorParte,
                2
            );

            /*
            |--------------------------------------------------------------------------
            | Explicación según método
            |--------------------------------------------------------------------------
            */

            $explicacion = match ($metodo) {

                'proporciones' =>
                    "$nombre participa en la razón "
                    . "$peso:$sumaIndices",

                'reduccion' =>
                    "$nombre recibe $peso unidades "
                    . "multiplicadas por el factor constante $fc",

                'alicuotas' =>
                    "$nombre recibe $peso partes "
                    . "alícuotas del total",

                default =>
                    'Distribución proporcional',
            };

            /*
            |--------------------------------------------------------------------------
            | Guardar resultado
            |--------------------------------------------------------------------------
            */

            $resultado[] = [

                'nombre' => $nombre,

                'indice' => $peso,

                'fraccion' => $fraccion,

                'parte' => $valorParte,

                'explicacion' => $explicacion,
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | Ajuste por redondeo
        |--------------------------------------------------------------------------
        */

        $diferencia = bcsub(
            $monto,
            $sumaPartes,
            2
        );

        if (
            bccomp($diferencia, '0', 2) !== 0
            && count($resultado) > 0
        ) {

            $ultimo = count($resultado) - 1;

            $resultado[$ultimo]['parte'] = bcadd(
                $resultado[$ultimo]['parte'],
                $diferencia,
                2
            );

            $sumaPartes = bcadd(
                $sumaPartes,
                $diferencia,
                2
            );
        }

        return [

            'metodo' => $metodo,

            'monto' => $monto,

            'factorConstante' => $fc,

            'sumaIndices' => $sumaIndices,

            'partes' => $resultado,

            'verificacion' => $sumaPartes,

            'cuadra' => bccomp(
                $monto,
                $sumaPartes,
                2
            ) === 0,
        ];
    }
}