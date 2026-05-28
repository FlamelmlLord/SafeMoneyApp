<?php

namespace App\Finance;

use InvalidArgumentException;

class RepartoInversoSimple
{
    private const SCALE = 10;

    /**
     * Reparto proporcional inverso simple
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
        | Calcular inversos
        |--------------------------------------------------------------------------
        */

        $inversos = [];

        $sumaInversos = '0';

        foreach ($partes as $parte) {

            $peso = Money::normalize(
                $parte['peso'] ?? 0
            );

            if ($peso === '0') {
                throw new InvalidArgumentException(
                    'Los índices no pueden ser cero'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Inverso = 1 / peso
            |--------------------------------------------------------------------------
            */

            $inverso = bcdiv(
                '1',
                $peso,
                self::SCALE
            );

            $inversos[] = $inverso;

            $sumaInversos = bcadd(
                $sumaInversos,
                $inverso,
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

            $peso = Money::normalize(
                $parte['peso']
            );

            $inverso = $inversos[$idx];

            /*
            |--------------------------------------------------------------------------
            | Fracción inversa
            |--------------------------------------------------------------------------
            */

            $fraccion = bcdiv(
                $inverso,
                $sumaInversos,
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

                'indice' => $peso,

                'inverso' => $inverso,

                'fraccion' => $fraccion,

                'parte' => $valorParte,

                'explicacion' =>
                    "$nombre recibe inversamente proporcional "
                    . "al índice $peso",
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

            'sumaInversos' => $sumaInversos,

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