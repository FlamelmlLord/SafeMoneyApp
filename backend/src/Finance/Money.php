<?php

declare(strict_types=1);

namespace App\Finance;

use InvalidArgumentException;

/**
 * Envoltura sobre BCMath para cálculos financieros con precisión decimal arbitraria.
 *
 * Todas las operaciones reciben y devuelven strings. La escala interna es 30 dígitos;
 * la escala de presentación es 10. Nunca se usa float en cálculos finales.
 */
final class Money
{
    public const SCALE_INTERNAL = 30;
    public const SCALE_DISPLAY = 10;

    public static function normalize(int|float|string $value): string
    {
        if (is_int($value) || is_float($value)) {
            $value = sprintf('%.30F', (float) $value);
        }
        $value = trim((string) $value);
        $value = str_replace(',', '.', $value);
        if ($value === '' || !is_numeric($value)) {
            throw new InvalidArgumentException("Valor numérico inválido: '$value'");
        }
        return $value;
    }

    public static function add(string|int|float $a, string|int|float $b, int $scale = self::SCALE_INTERNAL): string
    {
        return bcadd(self::normalize($a), self::normalize($b), $scale);
    }

    public static function sub(string|int|float $a, string|int|float $b, int $scale = self::SCALE_INTERNAL): string
    {
        return bcsub(self::normalize($a), self::normalize($b), $scale);
    }

    public static function mul(string|int|float $a, string|int|float $b, int $scale = self::SCALE_INTERNAL): string
    {
        return bcmul(self::normalize($a), self::normalize($b), $scale);
    }

    public static function div(string|int|float $a, string|int|float $b, int $scale = self::SCALE_INTERNAL): string
    {
        $bn = self::normalize($b);
        if (bccomp($bn, '0', $scale) === 0) {
            throw new InvalidArgumentException('División por cero');
        }
        return bcdiv(self::normalize($a), $bn, $scale);
    }

    public static function pow(string|int|float $base, string|int|float $exponent, int $scale = self::SCALE_INTERNAL): string
    {
        $b = self::normalize($base);
        $e = self::normalize($exponent);

        // Detectar exponente entero (parte fraccional toda en ceros)
        $eTrunc = bcadd($e, '0', 0); // parte entera como string
        if (bccomp($e, $eTrunc, $scale) === 0) {
            // Manejar exponentes negativos: bcpow soporta exponente negativo.
            return bcpow($b, $eTrunc, $scale);
        }

        // Exponente fraccionario: x^y = exp(y * ln(x))
        if (bccomp($b, '0', $scale) <= 0) {
            throw new InvalidArgumentException('pow con exponente fraccionario requiere base > 0');
        }
        $hi = $scale + 20;
        $ln = self::ln($b, $hi);
        $yLn = bcmul($e, $ln, $hi);
        return self::exp($yLn, $scale);
    }

    /**
     * Logaritmo natural por serie de Taylor centrada en 1.
     * Para x > 0, usamos descomposición x = 2^k * m con m ∈ [1, 2) y ln(x) = k*ln(2) + ln(m).
     */
    public static function ln(string|int|float $x, int $scale = self::SCALE_INTERNAL): string
    {
        $x = self::normalize($x);
        if (bccomp($x, '0', $scale) <= 0) {
            throw new InvalidArgumentException('ln definido sólo para x > 0');
        }

        $internal = $scale + 10;
        $k = 0;
        // Reducir a [1, 2)
        while (bccomp($x, '2', $internal) >= 0) {
            $x = bcdiv($x, '2', $internal);
            $k++;
        }
        while (bccomp($x, '1', $internal) < 0) {
            $x = bcmul($x, '2', $internal);
            $k--;
        }

        // ln(m) con m ∈ [1,2): usar y = (m-1)/(m+1), ln(m) = 2*(y + y^3/3 + y^5/5 + ...)
        $y = bcdiv(bcsub($x, '1', $internal), bcadd($x, '1', $internal), $internal);
        $y2 = bcmul($y, $y, $internal);
        $term = $y;
        $sum = $y;
        $i = 1;
        $max = 200;
        while ($i < $max) {
            $term = bcmul($term, $y2, $internal);
            $denom = (string) (2 * $i + 1);
            $add = bcdiv($term, $denom, $internal);
            $sum = bcadd($sum, $add, $internal);
            // Convergencia: si el término es muy pequeño, parar
            if (bccomp(self::abs($add), '0.' . str_repeat('0', $scale + 5) . '1', $internal) < 0) {
                break;
            }
            $i++;
        }
        $lnM = bcmul('2', $sum, $internal);

        // ln(2) precalculado a alta precisión
        $ln2 = '0.693147180559945309417232121458176568075500134360255254120680009493393621969694715605863326996418687542';
        $ln2 = bcadd('0', $ln2, $internal);

        $result = bcadd($lnM, bcmul((string) $k, $ln2, $internal), $internal);
        return self::truncRound($result, $scale);
    }

    /**
     * Redondeo interno half-away-from-zero usado por ln/exp/pow para no perder 1 ULP.
     */
    private static function truncRound(string $x, int $scale): string
    {
        return self::round($x, $scale);
    }

    /**
     * Exponencial e^x por serie de Taylor con reducción de argumento.
     */
    public static function exp(string|int|float $x, int $scale = self::SCALE_INTERNAL): string
    {
        $x = self::normalize($x);
        $internal = $scale + 10;

        // Reducir argumento: dividir por 2^n hasta |x| < 1, calcular y elevar al cuadrado n veces
        $n = 0;
        $absX = self::abs($x);
        while (bccomp($absX, '1', $internal) > 0) {
            $x = bcdiv($x, '2', $internal);
            $absX = bcdiv($absX, '2', $internal);
            $n++;
        }

        // Taylor: e^x = 1 + x + x^2/2! + x^3/3! + ...
        $sum = '1';
        $term = '1';
        $i = 1;
        $max = 200;
        while ($i < $max) {
            $term = bcmul($term, $x, $internal);
            $term = bcdiv($term, (string) $i, $internal);
            $sum = bcadd($sum, $term, $internal);
            if (bccomp(self::abs($term), '0.' . str_repeat('0', $scale + 5) . '1', $internal) < 0) {
                break;
            }
            $i++;
        }

        // Deshacer la reducción: (e^(x/2^n))^(2^n)
        for ($j = 0; $j < $n; $j++) {
            $sum = bcmul($sum, $sum, $internal);
        }

        return self::truncRound($sum, $scale);
    }

    public static function abs(string|int|float $x): string
    {
        $x = self::normalize($x);
        return str_starts_with($x, '-') ? substr($x, 1) : $x;
    }

    public static function neg(string|int|float $x, int $scale = self::SCALE_INTERNAL): string
    {
        return bcmul(self::normalize($x), '-1', $scale);
    }

    public static function eq(string|int|float $a, string|int|float $b, int $scale = self::SCALE_DISPLAY): bool
    {
        return bccomp(self::normalize($a), self::normalize($b), $scale) === 0;
    }

    public static function gt(string|int|float $a, string|int|float $b, int $scale = self::SCALE_INTERNAL): bool
    {
        return bccomp(self::normalize($a), self::normalize($b), $scale) > 0;
    }

    public static function lt(string|int|float $a, string|int|float $b, int $scale = self::SCALE_INTERNAL): bool
    {
        return bccomp(self::normalize($a), self::normalize($b), $scale) < 0;
    }

    /**
     * Redondeo half-away-from-zero a 'decimals' decimales.
     * Suma 0.5·10^-decimals al valor con precisión interna alta y luego trunca por string slicing,
     * para evitar que bcadd con scale pequeño descarte precisión de inputs largos.
     */
    public static function round(string|int|float $x, int $decimals = self::SCALE_DISPLAY): string
    {
        $x = self::normalize($x);
        $neg = str_starts_with($x, '-');
        if ($neg) {
            $x = substr($x, 1);
        }

        $internalScale = max(self::SCALE_INTERNAL, strlen($x));
        $half = '0.' . ($decimals > 0 ? str_repeat('0', $decimals) : '') . '5';
        if ($decimals === 0) {
            $half = '0.5';
        }

        $sumFull = bcadd($x, $half, $internalScale);

        $pos = strpos($sumFull, '.');
        if ($pos === false) {
            $result = $decimals > 0 ? $sumFull . '.' . str_repeat('0', $decimals) : $sumFull;
        } elseif ($decimals === 0) {
            $result = substr($sumFull, 0, $pos);
        } else {
            $intPart = substr($sumFull, 0, $pos);
            $decPart = substr($sumFull, $pos + 1);
            $kept = str_pad(substr($decPart, 0, $decimals), $decimals, '0', STR_PAD_RIGHT);
            $result = $intPart . '.' . $kept;
        }

        return $neg && bccomp($result, '0', $decimals) !== 0 ? '-' . $result : $result;
    }

    public static function display(string|int|float $x, int $decimals = self::SCALE_DISPLAY): string
    {
        return self::round($x, $decimals);
    }

    /**
     * Raíz n-ésima de x para n entero positivo, vía exp(ln(x)/n).
     */
    public static function nthRoot(string|int|float $x, int $n, int $scale = self::SCALE_INTERNAL): string
    {
        if ($n <= 0) {
            throw new InvalidArgumentException('Raíz n-ésima requiere n entero positivo');
        }
        $x = self::normalize($x);
        if (bccomp($x, '0', $scale) < 0) {
            throw new InvalidArgumentException('Raíz n-ésima de número negativo no soportada');
        }
        if (bccomp($x, '0', $scale) === 0) {
            return '0';
        }
        $hi = $scale + 20;
        $ln = self::ln($x, $hi);
        $div = bcdiv($ln, (string) $n, $hi);
        return self::exp($div, $scale);
    }
}
