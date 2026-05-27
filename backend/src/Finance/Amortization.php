<?php

declare(strict_types=1);

namespace App\Finance;

/**
 * Tablas de amortización: francés, alemán, americano y colombiano.
 *
 *  - Francés: cuota fija. A = P·i/[1−(1+i)^(−n)]. Interés = saldo·i, abono = cuota − interés.
 *  - Alemán: capital fijo. abono = P/n. Interés = saldo·i. Cuota = abono + interés (decreciente).
 *  - Americano: pagar sólo intereses periódicos; al final pagar todo el capital.
 *  - Colombiano (cuota constante en pesos): cálculo francés pero con corrección por inflación opcional.
 *    Si se proporciona inflacionEsperada > 0, las cuotas se ajustan a la tasa real i_real = (1+i)/(1+inf) − 1
 *    y la cuota nominal crece con la inflación (cuota constante en términos reales).
 *
 * Devuelve siempre: { cuota?, tabla:[{periodo, cuota, interes, abono, saldo}], totales:{interes, capital, total} }
 */
final class Amortization
{
    public static function frances(string|float $P, string|float $i, int $n): array
    {
        $A = Annuity::cuotaDadoP($P, $i, $n)['resultado'];
        $saldo = Money::normalize($P);
        $tabla = [];
        $totalInteres = '0';

        for ($k = 1; $k <= $n; $k++) {
            $interes = Money::mul($saldo, $i);
            $abono = Money::sub($A, $interes);
            $saldo = Money::sub($saldo, $abono);
            $totalInteres = Money::add($totalInteres, $interes);
            $tabla[] = [
                'periodo' => $k,
                'cuota' => Money::display($A, 2),
                'interes' => Money::display($interes, 2),
                'abono' => Money::display($abono, 2),
                'saldo' => Money::display(Money::abs($saldo), 2),
            ];
        }

        return [
            'sistema' => 'frances',
            'cuota' => Money::display($A, 2),
            'tabla' => $tabla,
            'totales' => [
                'interes' => Money::display($totalInteres, 2),
                'capital' => Money::display($P, 2),
                'total' => Money::display(Money::add($P, $totalInteres), 2),
            ],
        ];
    }

    public static function aleman(string|float $P, string|float $i, int $n): array
    {
        $abono = Money::div($P, (string) $n);
        $saldo = Money::normalize($P);
        $tabla = [];
        $totalInteres = '0';

        for ($k = 1; $k <= $n; $k++) {
            $interes = Money::mul($saldo, $i);
            $cuota = Money::add($abono, $interes);
            $saldo = Money::sub($saldo, $abono);
            $totalInteres = Money::add($totalInteres, $interes);
            $tabla[] = [
                'periodo' => $k,
                'cuota' => Money::display($cuota, 2),
                'interes' => Money::display($interes, 2),
                'abono' => Money::display($abono, 2),
                'saldo' => Money::display(Money::abs($saldo), 2),
            ];
        }

        return [
            'sistema' => 'aleman',
            'tabla' => $tabla,
            'totales' => [
                'interes' => Money::display($totalInteres, 2),
                'capital' => Money::display($P, 2),
                'total' => Money::display(Money::add($P, $totalInteres), 2),
            ],
        ];
    }

    public static function americano(string|float $P, string|float $i, int $n): array
    {
        $interesPeriodico = Money::mul($P, $i);
        $tabla = [];
        $totalInteres = '0';

        for ($k = 1; $k <= $n; $k++) {
            $abono = $k === $n ? $P : '0';
            $saldoFinal = $k === $n ? '0' : $P;
            $cuota = Money::add($interesPeriodico, $abono);
            $totalInteres = Money::add($totalInteres, $interesPeriodico);
            $tabla[] = [
                'periodo' => $k,
                'cuota' => Money::display($cuota, 2),
                'interes' => Money::display($interesPeriodico, 2),
                'abono' => Money::display($abono, 2),
                'saldo' => Money::display($saldoFinal, 2),
            ];
        }

        return [
            'sistema' => 'americano',
            'tabla' => $tabla,
            'totales' => [
                'interes' => Money::display($totalInteres, 2),
                'capital' => Money::display($P, 2),
                'total' => Money::display(Money::add($P, $totalInteres), 2),
            ],
        ];
    }

    /**
     * Sistema colombiano: cuota constante en pesos (modalidad más común en créditos
     * hipotecarios y de consumo en Colombia). Si se proporciona inflacionEsperada > 0,
     * las cuotas crecen con la inflación (cuota constante en UVR).
     */
    public static function colombiano(string|float $P, string|float $i, int $n, string|float $inflacionEsperada = 0): array
    {
        if (Money::eq($inflacionEsperada, 0)) {
            $resultado = self::frances($P, $i, $n);
            $resultado['sistema'] = 'colombiano';
            $resultado['nota'] = 'Sin inflación — equivalente al sistema francés.';
            return $resultado;
        }

        // i_real = (1+i)/(1+inf) − 1
        $iReal = Money::sub(
            Money::div(Money::add('1', $i), Money::add('1', $inflacionEsperada)),
            '1'
        );

        $cuotaReal = Annuity::cuotaDadoP($P, $iReal, $n)['resultado'];
        $saldo = Money::normalize($P);
        $tabla = [];
        $totalInteres = '0';

        for ($k = 1; $k <= $n; $k++) {
            // Cuota crece con inflación
            $factorInflacion = Money::pow(Money::add('1', $inflacionEsperada), (string) $k);
            $cuotaNominal = Money::mul($cuotaReal, $factorInflacion);
            $interes = Money::mul($saldo, $i);
            $abono = Money::sub($cuotaNominal, $interes);
            $saldo = Money::sub($saldo, $abono);
            $totalInteres = Money::add($totalInteres, $interes);
            $tabla[] = [
                'periodo' => $k,
                'cuota' => Money::display($cuotaNominal, 2),
                'interes' => Money::display($interes, 2),
                'abono' => Money::display($abono, 2),
                'saldo' => Money::display(Money::abs($saldo), 2),
            ];
        }

        return [
            'sistema' => 'colombiano',
            'cuotaReal' => Money::display($cuotaReal, 2),
            'tasaReal' => Money::display($iReal),
            'nota' => 'Cuota constante en UVR ajustada por inflación. Sistema usado por la banca colombiana en créditos indexados.',
            'tabla' => $tabla,
            'totales' => [
                'interes' => Money::display($totalInteres, 2),
                'capital' => Money::display($P, 2),
                'total' => Money::display(Money::add($P, $totalInteres), 2),
            ],
        ];
    }

    public static function generar(string $sistema, string|float $P, string|float $i, int $n, string|float $inflacion = 0): array
    {
        return match (strtolower($sistema)) {
            'frances', 'francés' => self::frances($P, $i, $n),
            'aleman', 'alemán' => self::aleman($P, $i, $n),
            'americano' => self::americano($P, $i, $n),
            'colombiano' => self::colombiano($P, $i, $n, $inflacion),
            default => throw new \InvalidArgumentException("Sistema desconocido: $sistema"),
        };
    }
}
