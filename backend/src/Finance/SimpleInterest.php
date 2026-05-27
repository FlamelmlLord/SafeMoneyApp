<?php

declare(strict_types=1);

namespace App\Finance;

/**
 * Interés Simple:
 *   I = P · i · n
 *   F = P · (1 + i · n)
 *   P = F / (1 + i · n)
 *   i = (F − P) / (P · n) = I / (P · n)
 *   n = (F − P) / (P · i) = I / (P · i)
 *
 * El parámetro 'unidad' indica la unidad temporal de n (diaria, mensual, etc.).
 * Si tiempoEnDias es true, n se interpreta en días y se convierte usando 'baseDias' (360 o 365).
 */
final class SimpleInterest
{
    public static function calcularF(string|float $P, string|float $i, string|float $n): array
    {
        $factor = Money::add('1', Money::mul($i, $n));
        $F = Money::mul($P, $factor);
        return [
            'resultado' => Money::display($F),
            'pasos' => [
                ['expr' => 'F = P · (1 + i · n)'],
                ['expr' => "F = $P · (1 + $i · $n) = $P · " . Money::display($factor) . ' = ' . Money::display($F)],
            ],
        ];
    }

    public static function calcularP(string|float $F, string|float $i, string|float $n): array
    {
        $factor = Money::add('1', Money::mul($i, $n));
        $P = Money::div($F, $factor);
        return [
            'resultado' => Money::display($P),
            'pasos' => [
                ['expr' => 'P = F / (1 + i · n)'],
                ['expr' => "P = $F / (1 + $i · $n) = $F / " . Money::display($factor) . ' = ' . Money::display($P)],
            ],
        ];
    }

    public static function calcularI(string|float $P, string|float $F, string|float $n): array
    {
        $iTotal = Money::sub($F, $P);
        $i = Money::div($iTotal, Money::mul($P, $n));
        return [
            'resultado' => Money::display($i),
            'pasos' => [
                ['expr' => 'i = (F − P) / (P · n)'],
                ['expr' => "i = ($F − $P) / ($P · $n) = " . Money::display($iTotal) . ' / ' . Money::display(Money::mul($P, $n)) . ' = ' . Money::display($i)],
            ],
        ];
    }

    public static function calcularN(string|float $P, string|float $F, string|float $i): array
    {
        $iTotal = Money::sub($F, $P);
        $n = Money::div($iTotal, Money::mul($P, $i));
        return [
            'resultado' => Money::display($n),
            'pasos' => [
                ['expr' => 'n = (F − P) / (P · i)'],
                ['expr' => "n = ($F − $P) / ($P · $i) = " . Money::display($iTotal) . ' / ' . Money::display(Money::mul($P, $i)) . ' = ' . Money::display($n)],
            ],
        ];
    }

    public static function interesTotal(string|float $P, string|float $i, string|float $n): array
    {
        $I = Money::mul(Money::mul($P, $i), $n);
        return [
            'resultado' => Money::display($I),
            'pasos' => [
                ['expr' => 'I = P · i · n'],
                ['expr' => "I = $P · $i · $n = " . Money::display($I)],
            ],
        ];
    }
}
