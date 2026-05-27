<?php

declare(strict_types=1);

namespace App\Finance;

/**
 * Interés Compuesto:
 *   F = P · (1 + i)^n
 *   P = F · (1 + i)^(-n)
 *   n = ln(F/P) / ln(1+i)
 *   i = (F/P)^(1/n) − 1
 *   I = F − P
 */
final class CompoundInterest
{
    public static function calcularF(string|float $P, string|float $i, string|float $n): array
    {
        $factor = Money::pow(Money::add('1', $i), $n);
        $F = Money::mul($P, $factor);
        return [
            'resultado' => Money::display($F),
            'pasos' => [
                ['expr' => 'F = P · (1 + i)^n'],
                ['expr' => "F = $P · (1 + $i)^$n = $P · " . Money::display($factor) . ' = ' . Money::display($F)],
            ],
        ];
    }

    public static function calcularP(string|float $F, string|float $i, string|float $n): array
    {
        $factor = Money::pow(Money::add('1', $i), $n);
        $P = Money::div($F, $factor);
        return [
            'resultado' => Money::display($P),
            'pasos' => [
                ['expr' => 'P = F · (1 + i)^(−n)'],
                ['expr' => "P = $F / (1 + $i)^$n = $F / " . Money::display($factor) . ' = ' . Money::display($P)],
            ],
        ];
    }

    public static function calcularN(string|float $P, string|float $F, string|float $i): array
    {
        $ratio = Money::div($F, $P);
        $num = Money::ln($ratio);
        $den = Money::ln(Money::add('1', $i));
        $n = Money::div($num, $den);
        return [
            'resultado' => Money::display($n),
            'pasos' => [
                ['expr' => 'n = ln(F/P) / ln(1+i)'],
                ['expr' => "n = ln($F/$P) / ln(1+$i) = " . Money::display($num) . ' / ' . Money::display($den) . ' = ' . Money::display($n)],
            ],
        ];
    }

    public static function calcularI(string|float $P, string|float $F, string|float $n): array
    {
        $ratio = Money::div($F, $P);
        // i = ratio^(1/n) − 1
        $iPlus1 = Money::pow($ratio, Money::div('1', $n));
        $i = Money::sub($iPlus1, '1');
        return [
            'resultado' => Money::display($i),
            'pasos' => [
                ['expr' => 'i = (F/P)^(1/n) − 1'],
                ['expr' => "i = ($F/$P)^(1/$n) − 1 = " . Money::display($iPlus1) . ' − 1 = ' . Money::display($i)],
            ],
        ];
    }

    public static function interesTotal(string|float $P, string|float $i, string|float $n): array
    {
        $f = self::calcularF($P, $i, $n)['resultado'];
        $I = Money::sub($f, $P);
        return [
            'resultado' => Money::display($I),
            'pasos' => [
                ['expr' => 'I = F − P'],
                ['expr' => "I = $f − $P = " . Money::display($I)],
            ],
        ];
    }

    /**
     * Series para comparativa visual interés simple vs compuesto.
     * Devuelve array de puntos { n, simple, compuesto } para n = 0..nMax.
     */
    public static function comparativaSimpleVsCompuesto(string|float $P, string|float $i, int $nMax): array
    {
        $serie = [];
        for ($k = 0; $k <= $nMax; $k++) {
            $serie[] = [
                'n' => $k,
                'simple' => Money::display(SimpleInterest::calcularF($P, $i, $k)['resultado'], 2),
                'compuesto' => Money::display(self::calcularF($P, $i, $k)['resultado'], 2),
            ];
        }
        return ['serie' => $serie];
    }
}
