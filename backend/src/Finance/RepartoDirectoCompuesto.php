<?php

namespace App\Finance;

use InvalidArgumentException;

class RepartoDirectoCompuesto
{
    private const SCALE = 10;

    /**
     * Reparto proporcional directo compuesto
     *
     * Fórmula:
     * índice = capital × tiempo
     */
    public static function calcular(
        $monto,
        array $partes
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
        | Calcular índices compuestos
        |--------------------------------------------------------------------------
        */

        $indices = [];

        $sumaIndices = '0';

        foreach ($partes as $parte) {

            $capital = Money::normalize(
                $parte['capital'] ?? 0
            );

            $tiempo = Money::normalize(
                $parte['tiempo'] ?? 0
            );

            if ($capital === '0') {
                throw new InvalidArgumentException(
                    'El capital no puede ser cero'
                );
            }

            if ($tiempo === '0') {
                throw new InvalidArgumentException(
                    'El tiempo no puede ser cero'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Índice compuesto
            |--------------------------------------------------------------------------
            */

            $indice = bcmul(
                $capital,
                $tiempo,
                self::SCALE
            );

            $indices[] = $indice;

            $sumaIndices = bcadd(
                $sumaIndices,
                $indice,
                self::SCALE
            );
        }

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

            $capital = Money::normalize(
                $parte['capital']
            );

            $tiempo = Money::normalize(
                $parte['tiempo']
            );

            $indice = $indices[$idx];

            /*
            |--------------------------------------------------------------------------
            | Fracción
            |--------------------------------------------------------------------------
            */

            $fraccion = bcdiv(
                $indice,
                $sumaIndices,
                self::SCALE
            );

            /*
            |--------------------------------------------------------------------------
            | Parte monetaria
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

            $resultado[] = [

                'nombre' => $nombre,

                'capital' => $capital,

                'tiempo' => $tiempo,

                'indiceCompuesto' => $indice,

                'fraccion' => $fraccion,

                'parte' => $valorParte,

                'explicacion' =>
                    "$nombre participa con índice compuesto "
                    . "($capital × $tiempo) = $indice",
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | Ajuste financiero
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

            'monto' => $monto,

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