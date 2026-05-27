<?php

declare(strict_types=1);

namespace App\Finance;

/**
 * Abonos extraordinarios sobre un crédito amortizado en sistema francés.
 *
 * - reducirTiempo(P, i, n, abono, periodoAbono): mantiene cuota original, recalcula n.
 * - reducirCuota(P, i, n, abono, periodoAbono): mantiene n original, recalcula cuota.
 *
 * El abono se aplica al saldo después de la cuota del periodoAbono. Devuelve la tabla completa
 * mostrando el efecto del abono y el ahorro en intereses.
 */
final class ExtraPayment
{
    public static function reducirTiempo(string|float $P, string|float $i, int $n, string|float $abono, int $periodoAbono): array
    {
        $cuota = Annuity::cuotaDadoP($P, $i, $n)['resultado'];
        $saldo = Money::normalize($P);
        $tabla = [];
        $totalInteres = '0';
        $k = 1;
        $abonoAplicado = false;

        while (Money::gt($saldo, '0.01') && $k <= 1000) {
            $interes = Money::mul($saldo, $i);
            $abonoCapital = Money::sub($cuota, $interes);
            $extra = '0';

            if (!$abonoAplicado && $k === $periodoAbono) {
                $extra = Money::normalize($abono);
                $abonoAplicado = true;
            }

            // Si la cuota + abono extra excede el saldo, ajustar
            $pago = Money::add($abonoCapital, $extra);
            if (Money::gt($pago, $saldo)) {
                $pago = $saldo;
                $abonoCapital = Money::sub($pago, $extra);
                if (Money::lt($abonoCapital, 0)) {
                    $abonoCapital = '0';
                    $extra = $pago;
                }
            }

            $saldo = Money::sub($saldo, $pago);
            $totalInteres = Money::add($totalInteres, $interes);
            $tabla[] = [
                'periodo' => $k,
                'cuota' => Money::display($cuota, 2),
                'interes' => Money::display($interes, 2),
                'abono' => Money::display($abonoCapital, 2),
                'abonoExtra' => Money::display($extra, 2),
                'saldo' => Money::display(Money::abs($saldo), 2),
            ];
            $k++;
        }

        $nOriginal = $n;
        $nNuevo = count($tabla);
        return [
            'estrategia' => 'reducir-tiempo',
            'cuota' => Money::display($cuota, 2),
            'tabla' => $tabla,
            'totales' => [
                'interes' => Money::display($totalInteres, 2),
                'capital' => Money::display($P, 2),
                'total' => Money::display(Money::add($P, $totalInteres), 2),
            ],
            'comparacion' => [
                'nOriginal' => $nOriginal,
                'nNuevo' => $nNuevo,
                'periodosAhorrados' => $nOriginal - $nNuevo,
            ],
        ];
    }

    public static function reducirCuota(string|float $P, string|float $i, int $n, string|float $abono, int $periodoAbono): array
    {
        $cuotaOriginal = Annuity::cuotaDadoP($P, $i, $n)['resultado'];
        $saldo = Money::normalize($P);
        $tabla = [];
        $totalInteres = '0';
        $cuotaActual = $cuotaOriginal;

        for ($k = 1; $k <= $n; $k++) {
            $interes = Money::mul($saldo, $i);
            $abonoCapital = Money::sub($cuotaActual, $interes);
            $extra = '0';
            $saldo = Money::sub($saldo, $abonoCapital);

            if ($k === $periodoAbono) {
                $extra = Money::normalize($abono);
                $saldo = Money::sub($saldo, $extra);
                // Recalcular cuota para los periodos restantes
                $restantes = $n - $k;
                if ($restantes > 0 && Money::gt($saldo, '0')) {
                    $cuotaActual = Annuity::cuotaDadoP($saldo, $i, $restantes)['resultado'];
                }
            }

            $totalInteres = Money::add($totalInteres, $interes);
            $tabla[] = [
                'periodo' => $k,
                'cuota' => Money::display($k === $periodoAbono ? $cuotaOriginal : ($k > $periodoAbono ? $cuotaActual : $cuotaOriginal), 2),
                'interes' => Money::display($interes, 2),
                'abono' => Money::display($abonoCapital, 2),
                'abonoExtra' => Money::display($extra, 2),
                'saldo' => Money::display(Money::abs($saldo), 2),
            ];
        }

        return [
            'estrategia' => 'reducir-cuota',
            'cuotaOriginal' => Money::display($cuotaOriginal, 2),
            'cuotaNueva' => Money::display($cuotaActual, 2),
            'tabla' => $tabla,
            'totales' => [
                'interes' => Money::display($totalInteres, 2),
                'capital' => Money::display($P, 2),
                'total' => Money::display(Money::add($P, $totalInteres), 2),
            ],
            'comparacion' => [
                'cuotaOriginal' => Money::display($cuotaOriginal, 2),
                'cuotaNueva' => Money::display($cuotaActual, 2),
                'ahorroPorCuota' => Money::display(Money::sub($cuotaOriginal, $cuotaActual), 2),
            ],
        ];
    }
}
