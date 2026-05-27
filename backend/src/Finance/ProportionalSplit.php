<?php

declare(strict_types=1);

namespace App\Finance;

/**
 * Reparto proporcional:
 *
 * Simple: distribuir un monto entre n partes según pesos (capital, tiempo, participación).
 *   parte_k = monto · peso_k / Σ pesos
 *
 * Compuesto (capital × tiempo): cada parte tiene capital y tiempo; el peso es capital·tiempo.
 *   parte_k = monto · (capital_k · tiempo_k) / Σ (capital_i · tiempo_i)
 */
final class ProportionalSplit
{
    /**
     * @param array<array{nombre?:string, peso: string|float}> $partes
     */
    public static function simple(string|float $monto, array $partes): array
    {
        $sumaPesos = '0';
        foreach ($partes as $p) {
            $sumaPesos = Money::add($sumaPesos, $p['peso']);
        }
        if (Money::eq($sumaPesos, 0)) {
            throw new \InvalidArgumentException('La suma de pesos no puede ser cero.');
        }

        $resultado = [];
        $verificacion = '0';
        foreach ($partes as $p) {
            $parte = Money::mul(Money::div($p['peso'], $sumaPesos), $monto);
            $resultado[] = [
                'nombre' => $p['nombre'] ?? '',
                'peso' => Money::display($p['peso']),
                'fraccion' => Money::display(Money::div($p['peso'], $sumaPesos)),
                'parte' => Money::display($parte, 2),
            ];
            $verificacion = Money::add($verificacion, $parte);
        }

        return [
            'partes' => $resultado,
            'sumaPesos' => Money::display($sumaPesos),
            'verificacion' => Money::display($verificacion, 2),
            'monto' => Money::display($monto, 2),
            'cuadra' => Money::eq($verificacion, $monto, 2),
        ];
    }

    /**
     * @param array<array{nombre?:string, capital: string|float, tiempo: string|float}> $partes
     */
    public static function compuesto(string|float $monto, array $partes): array
    {
        $partesConPeso = array_map(
            fn($p) => [
                'nombre' => $p['nombre'] ?? '',
                'peso' => Money::mul($p['capital'], $p['tiempo']),
                'capital' => Money::display($p['capital'], 2),
                'tiempo' => Money::display($p['tiempo']),
            ],
            $partes
        );

        $base = self::simple($monto, $partesConPeso);

        // Anexar capital/tiempo para vista didáctica
        foreach ($base['partes'] as $idx => &$parte) {
            $parte['capital'] = $partesConPeso[$idx]['capital'];
            $parte['tiempo'] = $partesConPeso[$idx]['tiempo'];
        }

        $base['tipo'] = 'compuesto';
        return $base;
    }
}
