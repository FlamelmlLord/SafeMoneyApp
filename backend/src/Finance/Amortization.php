<?php

declare(strict_types=1);

namespace App\Finance;

final class Amortization
{
    public static function calcular(
        string|float $P,
        string|float $i,
        int $n,
        array $abonos = []
    ): array {

        $P = Money::normalize($P);

        $A = self::cuota(
            $P,
            $i,
            $n
        );

        $saldo = $P;

        $tabla = [];

        $totalInteres = '0';

        $cuotaActual = $A;

        $periodo = 0;

        while (
            Money::gt($saldo, 0)
            && $periodo < 1000
        ) {

            $periodo++;

            $interes = Money::mul(
                $saldo,
                $i
            );

            $abonoCapital = Money::sub(
                $cuotaActual,
                $interes
            );

            $abonoExtra = '0';

            foreach ($abonos as $a) {

                if (
                    (int)$a['periodo']
                    === $periodo
                ) {

                    $abonoExtra =
                        $a['valor'];

                    $abonoCapital =
                        Money::add(
                            $abonoCapital,
                            $abonoExtra
                        );

                    if (
                        $a['tipo']
                        === 'reducir-cuota'
                    ) {

                        $restantes =
                            $n - $periodo;

                        $saldoTemporal =
                            Money::sub(
                                $saldo,
                                $abonoCapital
                            );

                        if ($restantes > 0) {

                            $cuotaActual =
                                self::cuota(
                                    $saldoTemporal,
                                    $i,
                                    $restantes
                                );
                        }
                    }
                }
            }

            $saldo = Money::sub(
                $saldo,
                $abonoCapital
            );

            if (
                Money::lt($saldo, 0)
            ) {
                $saldo = '0';
            }

            $totalInteres =
                Money::add(
                    $totalInteres,
                    $interes
                );

            $tabla[] = [

                'periodo' => $periodo,

                'cuota' => Money::display(
                    $cuotaActual,
                    2
                ),

                'interes' => Money::display(
                    $interes,
                    2
                ),

                'abono' => Money::display(
                    $abonoCapital,
                    2
                ),

                'abonoExtra' =>
                Money::display(
                    $abonoExtra,
                    2
                ),

                'saldo' => Money::display(
                    $saldo,
                    2
                ),
            ];
        }

        return [

            'cuota' => Money::display(
                $A,
                2
            ),

            'tabla' => $tabla,

            'totales' => [

                'interes' =>
                Money::display(
                    $totalInteres,
                    2
                ),

                'total' =>
                Money::display(
                    Money::add(
                        $P,
                        $totalInteres
                    ),
                    2
                ),
            ],
        ];
    }

    private static function cuota(
        string|float $P,
        string|float $i,
        int $n
    ): string {

        $unoMasI =
            Money::add('1', $i);

        $potencia =
            Money::pow(
                $unoMasI,
                (string)(-$n)
            );

        $denominador =
            Money::sub(
                '1',
                $potencia
            );

        $fraccion =
            Money::div(
                $i,
                $denominador
            );

        return Money::mul(
            $P,
            $fraccion
        );
    }
}
