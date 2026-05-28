<?php

declare(strict_types=1);

namespace App\Finance;

final class Annuity
{
    public static function resolver(array $d): array
    {
        $tipo = $d['tipo'];

        $calcular = $d['calcular'];

        $P = $d['P'] ?? '0';
        $F = $d['F'] ?? '0';
        $A = $d['A'] ?? '0';

        $tasa = $d['tasa'];

        $tipoTasa = $d['tipoTasa'];

        $periodoTasa = (int)$d['periodoTasa'];
        $periodoPago = (int)$d['periodoPago'];

        $n = (int)$d['n'];

        $k = (int)($d['k'] ?? 0);

        $pasos = [];

        /*
        |--------------------------------------------------------------------------
        | TASA EQUIVALENTE
        |--------------------------------------------------------------------------
        */

        if ($tipoTasa === 'nominal') {

            $iBase = Money::div(
                $tasa,
                (string)$periodoTasa
            );

            $pasos[] = [
                'expr' => "i base = J/m = $tasa / $periodoTasa = " .
                    Money::display($iBase)
            ];
        } else {

            $iBase = $tasa;

            $pasos[] = [
                'expr' => "Tasa efectiva base = " .
                    Money::display($iBase)
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | CONVERTIR AL PERIODO DE PAGO
        |--------------------------------------------------------------------------
        */

        if ($periodoTasa !== $periodoPago) {

            $ea = Money::sub(
                Money::pow(
                    Money::add('1', $iBase),
                    $periodoTasa
                ),
                '1'
            );

            $i = Money::sub(
                Money::nthRoot(
                    Money::add('1', $ea),
                    $periodoPago
                ),
                '1'
            );

            $pasos[] = [
                'expr' => "Conversión de tasa al periodo de pago"
            ];
        } else {

            $i = $iBase;
        }

        $pasos[] = [
            'expr' => "i equivalente = " .
                Money::display($i)
        ];

        /*
        |--------------------------------------------------------------------------
        | FACTORES
        |--------------------------------------------------------------------------
        */

        $factorVP = Money::div(
            Money::sub(
                '1',
                Money::pow(
                    Money::add('1', $i),
                    '-' . $n
                )
            ),
            $i
        );

        $factorVF = Money::div(
            Money::sub(
                Money::pow(
                    Money::add('1', $i),
                    $n
                ),
                '1'
            ),
            $i
        );

        /*
        |--------------------------------------------------------------------------
        | ANTICIPADA
        |--------------------------------------------------------------------------
        */

        if ($tipo === 'anticipada') {

            $factorVP = Money::mul(
                $factorVP,
                Money::add('1', $i)
            );

            $factorVF = Money::mul(
                $factorVF,
                Money::add('1', $i)
            );
        }

        /*
        |--------------------------------------------------------------------------
        | DIFERIDA
        |--------------------------------------------------------------------------
        */

        if ($tipo === 'diferida') {

            $descuento = Money::pow(
                Money::add('1', $i),
                '-' . $k
            );

            $factorVP = Money::mul(
                $factorVP,
                $descuento
            );

            $pasos[] = [
                'expr' => "Descuento por diferimiento k = $k"
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | CALCULOS
        |--------------------------------------------------------------------------
        */

        if ($calcular === 'P') {

            $resultado = Money::mul(
                $A,
                $factorVP
            );

            $pasos[] = [
                'expr' => "P = A × factorVP"
            ];
        } elseif ($calcular === 'F') {

            $resultado = Money::mul(
                $A,
                $factorVF
            );

            $pasos[] = [
                'expr' => "F = A × factorVF"
            ];
        } else {

            if (
                !Money::eq($P, '0')
            ) {

                $resultado = Money::div(
                    $P,
                    $factorVP
                );

                $pasos[] = [
                    'expr' => "A = P / factorVP"
                ];
            } else {

                $resultado = Money::div(
                    $F,
                    $factorVF
                );

                $pasos[] = [
                    'expr' => "A = F / factorVF"
                ];
            }
        }

        $pasos[] = [
            'expr' => "Resultado final = " .
                Money::display($resultado)
        ];

        return [

            'resultado' => Money::display(
                $resultado,
                2
            ),

            'tasaEquivalente' => Money::display($i),

            'pasos' => $pasos,
        ];
    }

    public static function perpetuidad(
        string $tipo,
        string $tipoTasa,
        string|float $A,
        string|float $tasa,
        int $m
    ): array {

        $pasos = [];

        /*
    |--------------------------------------------------------------------------
    | Convertir tasa a periódica efectiva
    |--------------------------------------------------------------------------
    */

        if ($tipoTasa === 'nominal') {

            $i = Money::div($tasa, (string)$m);

            $pasos[] = [
                'expr' =>
                "i = j / m = $tasa / $m = "
                    . Money::display($i)
            ];
        } else {

            $i = Money::normalize($tasa);

            $pasos[] = [
                'expr' =>
                "Tasa efectiva periódica i = "
                    . Money::display($i)
            ];
        }

        /*
    |--------------------------------------------------------------------------
    | Perpetuidad vencida
    |--------------------------------------------------------------------------
    */

        if ($tipo === 'vencida') {

            $vp = Money::div($A, $i);

            $pasos[] = [
                'expr' => 'VP = A / i'
            ];

            $pasos[] = [
                'expr' =>
                "VP = $A / "
                    . Money::display($i)
                    . " = "
                    . Money::display($vp)
            ];
        } else {

            /*
        |--------------------------------------------------------------------------
        | Perpetuidad anticipada
        |--------------------------------------------------------------------------
        */

            $factor = Money::add('1', $i);

            $vp = Money::mul(
                Money::div($A, $i),
                $factor
            );

            $pasos[] = [
                'expr' =>
                'VP = (A / i)(1+i)'
            ];

            $pasos[] = [
                'expr' =>
                "VP = ($A / "
                    . Money::display($i)
                    . ")(1 + "
                    . Money::display($i)
                    . ") = "
                    . Money::display($vp)
            ];
        }

        return [

            'resultado' => Money::display($vp),

            'pasos' => $pasos,
        ];
    }
}
