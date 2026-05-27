<?php

declare(strict_types=1);

namespace App\Finance;

use DateTimeImmutable;
use InvalidArgumentException;

/**
 * Convenciones de conteo de días: año comercial (360) y año civil (365).
 * Convierte tiempo entre días y períodos según selector global.
 */
final class DayCount
{
    public const COMERCIAL = 360;
    public const CIVIL = 365;

    public static function validate(int $base): int
    {
        if ($base !== self::COMERCIAL && $base !== self::CIVIL) {
            throw new InvalidArgumentException("Base de año inválida: $base. Use 360 o 365.");
        }
        return $base;
    }

    /**
     * Cuenta días entre dos fechas usando el método actual (real days, sin convenciones extras).
     */
    public static function daysBetween(string $from, string $to): int
    {
        $f = new DateTimeImmutable($from);
        $t = new DateTimeImmutable($to);
        return (int) $f->diff($t)->days * ($t >= $f ? 1 : -1);
    }

    /**
     * Convierte días a fracción de año según base (360 o 365).
     */
    public static function daysToYears(int|string $days, int $base = self::COMERCIAL): string
    {
        self::validate($base);
        return Money::div($days, (string) $base);
    }

    /**
     * Convierte fracción de año a días.
     */
    public static function yearsToDays(string|int|float $years, int $base = self::COMERCIAL): string
    {
        self::validate($base);
        return Money::mul($years, (string) $base);
    }

    /**
     * Convierte cualquier unidad temporal a número de periodos por año.
     * Unidades soportadas: diaria, semanal, quincenal, mensual, bimestral, trimestral, cuatrimestral, semestral, anual.
     */
    public static function periodsPerYear(string $unit, int $base = self::COMERCIAL): int
    {
        return match (strtolower($unit)) {
            'diaria', 'diario', 'daily' => $base,
            'semanal', 'weekly' => $base === self::COMERCIAL ? 52 : 52, // ambos convencional 52
            'quincenal', 'biweekly' => 24,
            'mensual', 'monthly' => 12,
            'bimestral', 'bimonthly' => 6,
            'trimestral', 'quarterly' => 4,
            'cuatrimestral' => 3,
            'semestral', 'semiannual' => 2,
            'anual', 'annual', 'yearly' => 1,
            default => throw new InvalidArgumentException("Unidad temporal desconocida: $unit"),
        };
    }
}
