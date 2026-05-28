<?php

declare(strict_types=1);

namespace App\Finance;

/**
 * Conversiones de tasas:
 *  - Nominal anual (J) ↔ periódica (i): i = J/m, J = i·m
 *  - Periódica (i) ↔ efectiva anual (EA): EA = (1+i)^m − 1, i = (1+EA)^(1/m) − 1
 *  - Vencida ↔ anticipada: i_a = i/(1+i), i = i_a/(1−i_a)
 *  - Equivalencia entre dos frecuencias periódicas distintas (vía EA)
 */
final class Rate
{
    public static function nominalToPeriodic(string|float $jAnual, int $m): array
    {
        $i = Money::div($jAnual, $m);
        return [
            'resultado' => Money::display($i),
            'pasos' => [
                ['expr' => 'i = J / m', 'detalle' => 'Tasa periódica = nominal anual / frecuencia de capitalización'],
                ['expr' => "i = $jAnual / $m = " . Money::display($i)],
            ],
        ];
    }

    public static function periodicToNominal(string|float $i, int $m): array
    {
        $j = Money::mul($i, $m);
        return [
            'resultado' => Money::display($j),
            'pasos' => [
                ['expr' => 'J = i × m'],
                ['expr' => "J = $i × $m = " . Money::display($j)],
            ],
        ];
    }

    public static function periodicToEffective(string|float $i, int $m): array
    {
        $ea = Money::sub(Money::pow(Money::add('1', $i), $m), '1');
        return [
            'resultado' => Money::display($ea),
            'pasos' => [
                ['expr' => 'EA = (1 + i)^m − 1'],
                ['expr' => "EA = (1 + $i)^$m − 1 = " . Money::display($ea)],
            ],
        ];
    }

    public static function effectiveToPeriodic(string|float $ea, int $m): array
    {
        $i = Money::sub(Money::nthRoot(Money::add('1', $ea), $m), '1');
        return [
            'resultado' => Money::display($i),
            'pasos' => [
                ['expr' => 'i = (1 + EA)^(1/m) − 1'],
                ['expr' => "i = (1 + $ea)^(1/$m) − 1 = " . Money::display($i)],
            ],
        ];
    }

    public static function vencidaToAnticipada(string|float $i): array
    {
        $ia = Money::div($i, Money::add('1', $i));
        return [
            'resultado' => Money::display($ia),
            'pasos' => [
                ['expr' => 'i_a = i / (1 + i)'],
                ['expr' => "i_a = $i / (1 + $i) = " . Money::display($ia)],
            ],
        ];
    }

    public static function anticipadaToVencida(string|float $ia): array
    {
        $i = Money::div($ia, Money::sub('1', $ia));
        return [
            'resultado' => Money::display($i),
            'pasos' => [
                ['expr' => 'i = i_a / (1 − i_a)'],
                ['expr' => "i = $ia / (1 − $ia) = " . Money::display($i)],
            ],
        ];
    }

    /**
     * Convertidor universal. Tipo origen y destino: 'nominal' | 'periodica' | 'efectiva' | 'anticipada-periodica' | 'anticipada-efectiva'.
     * Frecuencias en m periodos por año.
     */
    public static function convertir(
        string $tipoOrigen,
        string $tipoDestino,
        string|float $tasa,
        int $mOrigen,
        int $mDestino
    ): array {

        $pasos = [];

        /*
    |--------------------------------------------------------------------------
    | PASO 1
    | Convertir origen a tasa periódica vencida
    |--------------------------------------------------------------------------
    */

        if ($tipoOrigen === 'nominal') {

            $iOrigen = Money::div($tasa, (string)$mOrigen);

            $pasos[] = [
                'expr' => "i = J / m = $tasa / $mOrigen = " . Money::display($iOrigen)
            ];
        } else {

            $iOrigen = Money::normalize($tasa);

            $pasos[] = [
                'expr' => "Tasa efectiva periódica origen = " . Money::display($iOrigen)
            ];
        }

        /*
    |--------------------------------------------------------------------------
    | PASO 2
    | Hallar tasa efectiva anual equivalente
    |--------------------------------------------------------------------------
    */

        $ea = Money::sub(
            Money::pow(
                Money::add('1', $iOrigen),
                $mOrigen
            ),
            '1'
        );

        $pasos[] = [
            'expr' => "EA = (1 + i)^m - 1 = " . Money::display($ea)
        ];

        /*
    |--------------------------------------------------------------------------
    | PASO 3
    | Convertir EA a periódica destino
    |--------------------------------------------------------------------------
    */

        $iDestino = Money::sub(
            Money::nthRoot(
                Money::add('1', $ea),
                $mDestino
            ),
            '1'
        );

        $pasos[] = [
            'expr' => "i destino = (1 + EA)^(1/m) - 1 = " . Money::display($iDestino)
        ];

        /*
    |--------------------------------------------------------------------------
    | PASO 4
    | Si destino es nominal
    |--------------------------------------------------------------------------
    */

        if ($tipoDestino === 'nominal') {

            $resultado = Money::mul(
                $iDestino,
                (string)$mDestino
            );

            $pasos[] = [
                'expr' => "J = i × m = "
                    . Money::display($iDestino)
                    . " × $mDestino = "
                    . Money::display($resultado)
            ];
        } else {

            $resultado = $iDestino;
        }

        return [
            'resultado' => Money::display($resultado),
            'pasos' => $pasos,
        ];
    }

    public static function equivalenciaSimple(
        string $tipoOrigen,
        string $tipoDestino,
        string|float $tasa,
        int $m
    ): array {

        if ($tipoOrigen === $tipoDestino) {

            return [
                'resultado' => Money::display($tasa),
                'pasos' => [
                    ['expr' => 'Las tasas ya son equivalentes']
                ]
            ];
        }

        /*
    |--------------------------------------------------------------------------
    | NOMINAL → EFECTIVA
    |--------------------------------------------------------------------------
    */

        if ($tipoOrigen === 'nominal' && $tipoDestino === 'efectiva') {

            $periodica = Money::div($tasa, $m);

            $ea = Money::sub(
                Money::pow(
                    Money::add('1', $periodica),
                    $m
                ),
                '1'
            );

            return [

                'resultado' => Money::display($ea),

                'pasos' => [

                    ['expr' => 'i = J / m'],

                    ['expr' => "i = $tasa / $m = " . Money::display($periodica)],

                    ['expr' => 'EA = (1 + i)^m - 1'],

                    ['expr' => "EA = (1 + $periodica)^$m - 1 = " . Money::display($ea)],
                ]
            ];
        }

        /*
    |--------------------------------------------------------------------------
    | EFECTIVA → NOMINAL
    |--------------------------------------------------------------------------
    */

        $periodica = Money::sub(
            Money::nthRoot(
                Money::add('1', $tasa),
                $m
            ),
            '1'
        );

        $j = Money::mul($periodica, $m);

        return [

            'resultado' => Money::display($j),

            'pasos' => [

                ['expr' => 'i = (1 + EA)^(1/m) - 1'],

                ['expr' => "i = (1 + $tasa)^(1/$m) - 1 = " . Money::display($periodica)],

                ['expr' => 'J = i · m'],

                ['expr' => "J = $periodica · $m = " . Money::display($j)],
            ]
        ];
    }

    public static function convertirAnticipadas(
        string $tipoOrigen,
        string $tipoDestino,
        string|float $tasa,
        int $mOrigen,
        int $mDestino
    ): array {

        $pasos = [];

        /*
    |--------------------------------------------------------------------------
    | PASO 1
    | Convertir origen a periódica vencida
    |--------------------------------------------------------------------------
    */

        if ($tipoOrigen === 'nominal') {

            $iOrigen = Money::div($tasa, (string)$mOrigen);
        } elseif ($tipoOrigen === 'nominal-anticipada') {

            $d = Money::div($tasa, (string)$mOrigen);

            $iOrigen = Money::div(
                $d,
                Money::sub('1', $d)
            );
        } elseif ($tipoOrigen === 'efectiva-anticipada') {

            $iOrigen = Money::div(
                $tasa,
                Money::sub('1', $tasa)
            );
        } else {

            $iOrigen = $tasa;
        }

        $pasos[] = [
            'expr' => "Tasa periódica vencida origen = "
                . Money::display($iOrigen)
        ];

        /*
    |--------------------------------------------------------------------------
    | PASO 2
    | Hallar EA
    |--------------------------------------------------------------------------
    */

        $ea = Money::sub(

            Money::pow(
                Money::add('1', $iOrigen),
                $mOrigen
            ),

            '1'
        );

        $pasos[] = [
            'expr' => "EA = " . Money::display($ea)
        ];

        /*
    |--------------------------------------------------------------------------
    | PASO 3
    | Hallar periódica vencida destino
    |--------------------------------------------------------------------------
    */

        $iDestino = Money::sub(

            Money::nthRoot(
                Money::add('1', $ea),
                $mDestino
            ),

            '1'
        );

        $pasos[] = [
            'expr' => "i destino = "
                . Money::display($iDestino)
        ];

        /*
    |--------------------------------------------------------------------------
    | PASO 4
    | Convertir según destino
    |--------------------------------------------------------------------------
    */

        if ($tipoDestino === 'efectiva') {

            $resultado = $iDestino;
        } elseif ($tipoDestino === 'nominal') {

            $resultado = Money::mul(
                $iDestino,
                (string)$mDestino
            );
        } elseif ($tipoDestino === 'efectiva-anticipada') {

            $resultado = Money::div(

                $iDestino,

                Money::add(
                    '1',
                    $iDestino
                )
            );
        } else {

            $d = Money::div(

                $iDestino,

                Money::add(
                    '1',
                    $iDestino
                )
            );

            $resultado = Money::mul(
                $d,
                (string)$mDestino
            );
        }

        return [

            'resultado' => Money::display($resultado),

            'pasos' => $pasos,
        ];
    }

    public static function tasaEfectivaComparar(
        string|float $capital,
        string|float $tasa,
        string|float $tiempo,
        string $tipo,
        int $mOrigen,
        int $mDestino
    ): array {

        $pasos = [];

        /*
    |--------------------------------------------------------------------------
    | SI ES ANTICIPADA → VENCIDA
    |--------------------------------------------------------------------------
    */

        if ($tipo === 'anticipada') {

            $tasa = self::anticipadaToVencida($tasa)['resultado'];

            $pasos[] = [
                'expr' => 'Conversión anticipada → vencida = '
                    . Money::display($tasa)
            ];
        }

        /*
    |--------------------------------------------------------------------------
    | EA
    |--------------------------------------------------------------------------
    */

        $ea = Money::sub(
            Money::pow(
                Money::add('1', $tasa),
                $mOrigen
            ),
            '1'
        );

        $pasos[] = [
            'expr' => 'EA = (1+i)^m - 1 = '
                . Money::display($ea)
        ];

        /*
    |--------------------------------------------------------------------------
    | TASA DESTINO
    |--------------------------------------------------------------------------
    */

        $iDestino = Money::sub(
            Money::nthRoot(
                Money::add('1', $ea),
                $mDestino
            ),
            '1'
        );

        $pasos[] = [
            'expr' => 'i destino = '
                . Money::display($iDestino)
        ];

        /*
    |--------------------------------------------------------------------------
    | NÚMERO DE PERIODOS
    |--------------------------------------------------------------------------
    */

        $n = Money::mul(
            $tiempo,
            (string)$mDestino
        );

        /*
    |--------------------------------------------------------------------------
    | MONTO
    |--------------------------------------------------------------------------
    */

        $F = Money::mul(
            $capital,
            Money::pow(
                Money::add('1', $iDestino),
                $n
            )
        );

        $pasos[] = [
            'expr' => 'F = P(1+i)^n'
        ];

        $pasos[] = [
            'expr' => "F = $capital(1+$iDestino)^$n = "
                . Money::display($F)
        ];

        return [

            'tasaEquivalente' => Money::display($iDestino),

            'montoFinal' => Money::display($F),

            'pasos' => $pasos,
        ];
    }
}
