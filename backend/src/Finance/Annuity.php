<?php

declare(strict_types=1);

namespace App\Finance;

/**
 * Anualidades / series uniformes:
 *
 * Vencidas (ordinarias):
 *   P = A · [1 − (1+i)^(−n)] / i
 *   F = A · [(1+i)^n − 1] / i
 *
 * Anticipadas:
 *   P_ant = P_v · (1 + i)
 *   F_ant = F_v · (1 + i)
 *
 * Diferidas (k períodos de gracia):
 *   P_dif = P_v / (1 + i)^k  (vencida diferida)
 *
 * Perpetuidades:
 *   VP∞_vencida = A / i
 *   VP∞_anticipada = (A / i) · (1 + i)
 *
 * Cuando i = 0 (caso degenerado): P = F = A · n.
 */
final class Annuity
{
    public static function valorPresenteVencida(string|float $A, string|float $i, string|float $n): array
    {
        if (Money::eq($i, 0)) {
            $P = Money::mul($A, $n);
            return [
                'resultado' => Money::display($P, 2),
                'pasos' => [
                    ['expr' => 'Caso i = 0: P = A · n'],
                    ['expr' => "P = $A · $n = " . Money::display($P)],
                ],
            ];
        }
        $potencia = Money::pow(Money::add('1', $i), Money::neg($n));
        $factor = Money::div(Money::sub('1', $potencia), $i);
        $P = Money::mul($A, $factor);
        return [
            'resultado' => Money::display($P, 2),
            'pasos' => [
                ['expr' => 'P = A · [1 − (1+i)^(−n)] / i'],
                ['expr' => "P = $A · [1 − (1+$i)^(−$n)] / $i = $A · " . Money::display($factor) . ' = ' . Money::display($P)],
            ],
        ];
    }

    public static function valorFuturoVencida(string|float $A, string|float $i, string|float $n): array
    {
        if (Money::eq($i, 0)) {
            $F = Money::mul($A, $n);
            return [
                'resultado' => Money::display($F, 2),
                'pasos' => [
                    ['expr' => 'Caso i = 0: F = A · n'],
                    ['expr' => "F = $A · $n = " . Money::display($F)],
                ],
            ];
        }
        $potencia = Money::pow(Money::add('1', $i), $n);
        $factor = Money::div(Money::sub($potencia, '1'), $i);
        $F = Money::mul($A, $factor);
        return [
            'resultado' => Money::display($F, 2),
            'pasos' => [
                ['expr' => 'F = A · [(1+i)^n − 1] / i'],
                ['expr' => "F = $A · [(1+$i)^$n − 1] / $i = $A · " . Money::display($factor) . ' = ' . Money::display($F)],
            ],
        ];
    }

    public static function valorPresenteAnticipada(string|float $A, string|float $i, string|float $n): array
    {
        $Pv = self::valorPresenteVencida($A, $i, $n)['resultado'];
        $Pant = Money::mul($Pv, Money::add('1', $i));
        return [
            'resultado' => Money::display($Pant, 2),
            'pasos' => [
                ['expr' => 'P_ant = P_vencida · (1 + i)'],
                ['expr' => "P_ant = $Pv · (1 + $i) = " . Money::display($Pant)],
            ],
        ];
    }

    public static function valorFuturoAnticipada(string|float $A, string|float $i, string|float $n): array
    {
        $Fv = self::valorFuturoVencida($A, $i, $n)['resultado'];
        $Fant = Money::mul($Fv, Money::add('1', $i));
        return [
            'resultado' => Money::display($Fant, 2),
            'pasos' => [
                ['expr' => 'F_ant = F_vencida · (1 + i)'],
                ['expr' => "F_ant = $Fv · (1 + $i) = " . Money::display($Fant)],
            ],
        ];
    }

    /**
     * Anualidad diferida vencida: k períodos de gracia antes del primer pago.
     */
    public static function valorPresenteDiferida(string|float $A, string|float $i, string|float $n, int $k): array
    {
        // Cálculo con precisión interna completa (sin pasar por display intermedio).
        if (Money::eq($i, 0)) {
            $Pv = Money::mul($A, $n);
        } else {
            $potencia = Money::pow(Money::add('1', $i), Money::neg($n));
            $factorAnualidad = Money::div(Money::sub('1', $potencia), $i);
            $Pv = Money::mul($A, $factorAnualidad);
        }
        $factor = Money::pow(Money::add('1', $i), (string) $k);
        $P = Money::div($Pv, $factor);
        return [
            'resultado' => Money::display($P, 2),
            'pasos' => [
                ['expr' => 'P_dif = P_vencida / (1 + i)^k'],
                ['expr' => "P_dif = " . Money::display($Pv, 2) . " / (1 + $i)^$k = " . Money::display($P, 2)],
            ],
        ];
    }

    public static function perpetuidadVencida(string|float $A, string|float $i): array
    {
        $VP = Money::div($A, $i);
        return [
            'resultado' => Money::display($VP, 2),
            'pasos' => [
                ['expr' => 'VP∞ = A / i'],
                ['expr' => "VP∞ = $A / $i = " . Money::display($VP)],
            ],
        ];
    }

    public static function perpetuidadAnticipada(string|float $A, string|float $i): array
    {
        $VPv = Money::div($A, $i);
        $VP = Money::mul($VPv, Money::add('1', $i));
        return [
            'resultado' => Money::display($VP, 2),
            'pasos' => [
                ['expr' => 'VP∞_ant = (A / i) · (1 + i)'],
                ['expr' => "VP∞_ant = ($A / $i) · (1 + $i) = " . Money::display($VP)],
            ],
        ];
    }

    /**
     * Resuelve A dado P (cuota necesaria para presente dado).
     * A = P · i / [1 − (1+i)^(−n)]
     */
    public static function cuotaDadoP(string|float $P, string|float $i, string|float $n): array
    {
        if (Money::eq($i, 0)) {
            $A = Money::div($P, $n);
            return ['resultado' => Money::display($A, 2), 'pasos' => [['expr' => 'Caso i=0: A = P/n'], ['expr' => "A = $P/$n = " . Money::display($A, 2)]]];
        }
        $potencia = Money::pow(Money::add('1', $i), Money::neg($n));
        $denom = Money::sub('1', $potencia);
        $A = Money::div(Money::mul($P, $i), $denom);
        return [
            'resultado' => Money::display($A, 2),
            'pasos' => [
                ['expr' => 'A = P · i / [1 − (1+i)^(−n)]'],
                ['expr' => "A = $P · $i / [1 − (1+$i)^(−$n)] = " . Money::display($A)],
            ],
        ];
    }

    /**
     * Resuelve A dado F (depósito periódico para alcanzar meta).
     * A = F · i / [(1+i)^n − 1]
     */
    public static function cuotaDadoF(string|float $F, string|float $i, string|float $n): array
    {
        if (Money::eq($i, 0)) {
            $A = Money::div($F, $n);
            return ['resultado' => Money::display($A, 2), 'pasos' => [['expr' => 'Caso i=0: A = F/n'], ['expr' => "A = $F/$n = " . Money::display($A, 2)]]];
        }
        $potencia = Money::pow(Money::add('1', $i), $n);
        $denom = Money::sub($potencia, '1');
        $A = Money::div(Money::mul($F, $i), $denom);
        return [
            'resultado' => Money::display($A, 2),
            'pasos' => [
                ['expr' => 'A = F · i / [(1+i)^n − 1]'],
                ['expr' => "A = $F · $i / [(1+$i)^$n − 1] = " . Money::display($A)],
            ],
        ];
    }

    /**
     * Resuelve n dado A, F (depósito y meta) usando despeje logarítmico.
     * n = ln(1 + F·i/A) / ln(1+i)
     */
    public static function calcularN(string|float $A, string|float $F, string|float $i): array
    {
        if (Money::eq($i, 0)) {
            $n = Money::div($F, $A);
            return ['resultado' => Money::display($n), 'pasos' => [['expr' => 'Caso i=0: n = F/A'], ['expr' => "n = $F/$A = " . Money::display($n)]]];
        }
        $arg = Money::add('1', Money::div(Money::mul($F, $i), $A));
        $n = Money::div(Money::ln($arg), Money::ln(Money::add('1', $i)));
        return [
            'resultado' => Money::display($n),
            'pasos' => [
                ['expr' => 'n = ln(1 + F·i/A) / ln(1+i)'],
                ['expr' => "n = ln(1 + {$F}·{$i}/{$A}) / ln(1+{$i}) = " . Money::display($n)],
            ],
        ];
    }

    /**
     * Resuelve i dado A, F, n por Newton-Raphson.
     * f(i) = A · [(1+i)^n − 1]/i − F = 0
     */
    public static function calcularI(string|float $A, string|float $F, string|float $n, int $maxIter = 100, string $tol = '0.0000000001'): array
    {
        $i = '0.05';
        for ($k = 0; $k < $maxIter; $k++) {
            $f = Money::sub(self::valorFuturoVencida($A, $i, $n)['resultado'], $F);
            // f'(i) numérica
            $h = '0.00000001';
            $f2 = Money::sub(self::valorFuturoVencida($A, Money::add($i, $h), $n)['resultado'], $F);
            $df = Money::div(Money::sub($f2, $f), $h);
            if (Money::eq($df, 0)) {
                break;
            }
            $delta = Money::div($f, $df);
            $i = Money::sub($i, $delta);
            if (Money::lt(Money::abs($delta), $tol)) {
                break;
            }
        }
        return [
            'resultado' => Money::display($i),
            'pasos' => [
                ['expr' => 'Resolución numérica (Newton-Raphson) sobre f(i) = A·[(1+i)^n−1]/i − F'],
                ['expr' => "i ≈ " . Money::display($i) . " ($k iteraciones)"],
            ],
        ];
    }
}
