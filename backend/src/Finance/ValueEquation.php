<?php

declare(strict_types=1);

namespace App\Finance;

final class ValueEquation
{
    public static function resolver(
        array $flujos,
        int $fechaFocal,
        string|float $i,
        string $tipoTasa,
        int $frecuencia
    ): array {

        $pasos = [];

        /*
        |--------------------------------------------------------------------------
        | TASA NOMINAL → PERIÓDICA
        |--------------------------------------------------------------------------
        */

        if ($tipoTasa === 'nominal') {

            $i = Money::div(
                $i,
                (string)$frecuencia
            );

            $pasos[] = [

                'expr' =>
                "i = J / m = "
                    . Money::display($i)
            ];
        }

        $coefX = '0';

        $constante = '0';

        $pasos[] = [

            'expr' =>
            "Fecha focal = $fechaFocal"
        ];

        foreach ($flujos as $f) {

            $monto =
                $f['monto'] ?? '0';

            $periodo =
                (int)($f['periodo'] ?? 0);

            $lado =
                $f['lado'] ?? 'izquierda';

            $tieneX =
                (bool)($f['tieneX'] ?? false);

            $coeficiente =
                $f['coeficienteX'] ?? '1';

            /*
            |--------------------------------------------------------------------------
            | FACTOR
            |--------------------------------------------------------------------------
            */

            $expo =
                $fechaFocal - $periodo;

            $factor = Money::pow(

                Money::add('1', $i),

                (string)$expo
            );

            $signo =
                $lado === 'izquierda'
                ? '1'
                : '-1';

            /*
            |--------------------------------------------------------------------------
            | FLUJO CON X
            |--------------------------------------------------------------------------
            */

            if ($tieneX) {

                $aporte = Money::mul(

                    Money::mul(
                        $signo,
                        $coeficiente
                    ),

                    $factor
                );

                $coefX = Money::add(
                    $coefX,
                    $aporte
                );

                $pasos[] = [

                    'expr' =>
                    "Flujo X en periodo $periodo → "
                        . Money::display($aporte)
                        . "X"
                ];

                continue;
            }

            /*
            |--------------------------------------------------------------------------
            | FLUJO NORMAL
            |--------------------------------------------------------------------------
            */

            $valorFocal = Money::mul(
                $monto,
                $factor
            );

            $aporte = Money::mul(
                $signo,
                $valorFocal
            );

            $constante = Money::add(
                $constante,
                $aporte
            );

            $pasos[] = [

                'expr' =>
                "$monto × "
                    . Money::display($factor)
                    . " = "
                    . Money::display($valorFocal)
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | VALIDACIÓN
        |--------------------------------------------------------------------------
        */

        if (Money::eq($coefX, '0')) {

            throw new \InvalidArgumentException(
                'No existe incógnita X'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | DESPEJAR X
        |--------------------------------------------------------------------------
        */

        $X = Money::div(

            Money::neg($constante),

            $coefX
        );

        $pasos[] = [

            'expr' =>
            Money::display($coefX)
                . "X + "
                . Money::display($constante)
                . " = 0"
        ];

        $pasos[] = [

            'expr' =>
            "X = "
                . Money::display($X)
        ];

        return [

            'resultado' =>
            Money::display($X, 2),

            'pasos' => $pasos,
        ];
    }
}
