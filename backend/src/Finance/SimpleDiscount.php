<?php

declare(strict_types=1);

namespace App\Finance;

/**
 * Descuento Simple:
 *
 * Comercial (bancario): D_c = F · d · n,  Valor transacción Vt = F − D_c = F · (1 − d·n)
 * Racional (matemático): D_r = F · i · n / (1 + i · n) — equivalente al interés simple descontado
 *
 * Conversión de tasas: i = d / (1 − d · n),  d = i / (1 + i · n)
 */
final class SimpleDiscount
{
    public static function comercial(string|float $F, string|float $d, string|float $n): array
    {
        $D = Money::mul(Money::mul($F, $d), $n);
        $Vt = Money::sub($F, $D);
        return [
            'resultado' => [
                'descuento' => Money::display($D),
                'valorTransaccion' => Money::display($Vt),
            ],
            'pasos' => [
                ['expr' => 'D = F · d · n'],
                ['expr' => "D = $F · $d · $n = " . Money::display($D)],
                ['expr' => 'Vt = F − D = ' . Money::display($Vt)],
            ],
        ];
    }

    public static function racional(string|float $F, string|float $i, string|float $n): array
    {
        $denom = Money::add('1', Money::mul($i, $n));
        $D = Money::div(Money::mul(Money::mul($F, $i), $n), $denom);
        $Vt = Money::sub($F, $D);
        return [
            'resultado' => [
                'descuento' => Money::display($D, 2),
                'valorTransaccion' => Money::display($Vt, 2),
            ],
            'pasos' => [
                ['expr' => 'D_r = (F · i · n) / (1 + i · n)'],
                ['expr' => "D_r = ($F · $i · $n) / (1 + $i · $n) = " . Money::display($D, 2)],
                ['expr' => 'Vt = F − D_r = ' . Money::display($Vt, 2)],
            ],
        ];
    }

    public static function descuentoToInteres(string|float $d, string|float $n): array
    {
        $i = Money::div($d, Money::sub('1', Money::mul($d, $n)));
        return [
            'resultado' => Money::display($i),
            'pasos' => [
                ['expr' => 'i = d / (1 − d · n)'],
                ['expr' => "i = $d / (1 − $d · $n) = " . Money::display($i)],
            ],
        ];
    }

    public static function interesToDescuento(string|float $i, string|float $n): array
    {
        $d = Money::div($i, Money::add('1', Money::mul($i, $n)));
        return [
            'resultado' => Money::display($d),
            'pasos' => [
                ['expr' => 'd = i / (1 + i · n)'],
                ['expr' => "d = $i / (1 + $i · $n) = " . Money::display($d)],
            ],
        ];
    }
}
