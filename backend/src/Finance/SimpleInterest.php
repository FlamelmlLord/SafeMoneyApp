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

    public static function calcularConMetodo(
        string $calcular,
        string|float|null $P,
        string|float|null $F,
        string|float|null $i,
        string|float|null $dias,
        string|float|null $meses,
        string|float|null $anio,
        string $metodo
    ): array {

        $baseDias = 360;

        /*
    |--------------------------------------------------------------------------
    | CONVERSIÓN DEL TIEMPO
    |--------------------------------------------------------------------------
    */

        if ($metodo === 'comercial') {

            // mes = 30
            // año = 360

            $diasCalculados = bcmul(
                (string)($meses ?? '0'),
                '30',
                10
            );

            $baseDias = 360;
        } elseif ($metodo === 'ideal') {

            /*
            |--------------------------------------------------------------------------
            | IDEAL
            |--------------------------------------------------------------------------
            | Usa:
            | - días reales del mes
            | - año real (365 o 366)
            */

            $mes = strtolower((string)($meses ?? 'febrero'));

            $anioNumero = (int)($anio ?? date('Y'));

            $bisiesto = self::esBisiesto($anioNumero);

            $diasMes = match ($mes) {

                'enero' => 31,
                'febrero' => $bisiesto ? 29 : 28,
                'marzo' => 31,
                'abril' => 30,
                'mayo' => 31,
                'junio' => 30,
                'julio' => 31,
                'agosto' => 31,
                'septiembre' => 30,
                'octubre' => 31,
                'noviembre' => 30,
                'diciembre' => 31,

                default => throw new \InvalidArgumentException(
                    'Mes inválido'
                ),
            };

            $diasCalculados = (string)$diasMes;

            $baseDias = $bisiesto ? 366 : 365;
        } elseif ($metodo === 'bancario') {

            // días reales
            // año = 360

            $diasCalculados = (string)($dias ?? '0');

            $baseDias = 360;
        } else {

            // racional

            $diasCalculados = (string)($dias ?? '0');

            $baseDias = self::esBisiesto(
                (int)($anio ?? date('Y'))
            ) ? 366 : 365;
        }

        /*
    |--------------------------------------------------------------------------
    | CONVERTIR AÑOS
    |--------------------------------------------------------------------------
    */

        $nConvertido = bcdiv(
            $diasCalculados,
            (string)$baseDias,
            10
        );

        /*
    |--------------------------------------------------------------------------
    | CÁLCULOS
    |--------------------------------------------------------------------------
    */

        $resultado = match ($calcular) {

            'F' => self::calcularF(
                $P,
                $i,
                $nConvertido
            ),

            'P' => self::calcularP(
                $F,
                $i,
                $nConvertido
            ),

            'i' => self::calcularI(
                $P,
                $F,
                $nConvertido
            ),

            'n' => [

                ...self::calcularN(
                    $P,
                    $F,
                    $i
                ),

                'resultado' => bcmul(
                    self::calcularN(
                        $P,
                        $F,
                        $i
                    )['resultado'],
                    (string)$baseDias,
                    10
                )
            ],

            'I' => self::interesTotal(
                $P,
                $i,
                $nConvertido
            ),

            default => throw new \InvalidArgumentException(
                'Tipo de cálculo inválido'
            ),
        };

        return [

            ...$resultado,

            'metodo' => ucfirst($metodo),

            'baseDias' => $baseDias,

            'diasCalculados' => $diasCalculados,

            'nConvertido' => $nConvertido,
        ];
    }

    private static function esBisiesto(int $anio): bool
    {
        return ($anio % 4 === 0 && $anio % 100 !== 0)
            || ($anio % 400 === 0);
    }
}
