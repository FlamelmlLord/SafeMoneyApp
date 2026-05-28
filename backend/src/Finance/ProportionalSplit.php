<?php

declare(strict_types=1);

namespace App\Finance;

use InvalidArgumentException;

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


    /**
     * Reparto proporcional inverso compuesto genérico
     *
     * Puede usar:
     * - edad y estatura
     * - capital y tiempo
     * - cualquier combinación de factores
     */
    public static function inversoCompuesto(
        $monto,
        array $partes
    ): array {

        $monto = Money::normalize($monto);

        if (empty($partes)) {

            throw new InvalidArgumentException(
                'Debe ingresar al menos una parte'
            );
        }

        $procesadas = [];

        $sumaFactoresInversos = '0';

        foreach ($partes as $parte) {

            $nombre = $parte['nombre'] ?? '';

            $factores = $parte['factores'] ?? [];

            if (empty($factores)) {

                throw new InvalidArgumentException(
                    'Cada participante debe tener factores'
                );
            }

            // producto de factores
            $producto = '1';

            $factoresNormalizados = [];

            foreach ($factores as $f) {

                $f = Money::normalize($f);

                if (
                    bccomp($f, '0', 10) <= 0
                ) {
                    throw new InvalidArgumentException(
                        'Todos los factores deben ser mayores que cero'
                    );
                }

                $factoresNormalizados[] = $f;

                $producto = bcmul(
                    $producto,
                    $f,
                    10
                );
            }

            // inverso
            $factorInverso = bcdiv(
                '1',
                $producto,
                10
            );

            $procesadas[] = [
                'nombre' => $nombre,
                'factores' => $factoresNormalizados,
                'producto' => $producto,
                'factorInverso' => $factorInverso,
            ];

            $sumaFactoresInversos = bcadd(
                $sumaFactoresInversos,
                $factorInverso,
                10
            );
        }

        $resultado = [];

        $verificacion = '0';

        foreach ($procesadas as $p) {

            // porcentaje
            $porcion = bcdiv(
                $p['factorInverso'],
                $sumaFactoresInversos,
                10
            );

            $porcentaje = bcmul(
                $porcion,
                '100',
                10
            );

            // dinero
            $parteDinero = bcmul(
                $monto,
                $porcion,
                10
            );

            $resultado[] = [
                'nombre' => $p['nombre'],
                'factores' => $p['factores'],
                'producto' => $p['producto'],
                'factorInverso' => $p['factorInverso'],
                'porcentaje' => $porcentaje,
                'parte' => $parteDinero,
            ];

            $verificacion = bcadd(
                $verificacion,
                $parteDinero,
                10
            );
        }

        return [
            'monto' => $monto,
            'sumaFactoresInversos' => $sumaFactoresInversos,
            'partes' => $resultado,
            'verificacion' => $verificacion,
            'cuadra' => bccomp(
                $monto,
                $verificacion,
                2
            ) === 0,
        ];
    }

    /**
     * Reparto proporcional directo compuesto
     *
     * Cada índice se obtiene multiplicando
     * todos los factores de cada participante.
     */
    public static function directoCompuesto(
        $monto,
        array $partes
    ): array {

        $monto = Money::normalize($monto);

        if (empty($partes)) {
            throw new InvalidArgumentException(
                'Debe proporcionar participantes'
            );
        }

        $sumaIndices = '0';
        $resultado = [];

        foreach ($partes as $parte) {

            $nombre = $parte['nombre'] ?? '';

            $factores = $parte['factores'] ?? [];

            if (empty($factores)) {
                throw new InvalidArgumentException(
                    'Cada participante debe tener factores'
                );
            }

            $indice = '1';

            foreach ($factores as $factor) {

                $factor = Money::normalize($factor);

                $indice = bcmul(
                    $indice,
                    $factor,
                    10
                );
            }

            $resultado[] = [
                'nombre' => $nombre,
                'factores' => $factores,
                'indice' => $indice,
            ];

            $sumaIndices = bcadd(
                $sumaIndices,
                $indice,
                10
            );
        }

        if ($sumaIndices === '0') {
            throw new InvalidArgumentException(
                'La suma de índices no puede ser cero'
            );
        }

        $verificacion = '0';

        foreach ($resultado as &$r) {

            $porcentaje = bcdiv(
                $r['indice'],
                $sumaIndices,
                10
            );

            $parteDinero = bcmul(
                $monto,
                $porcentaje,
                10
            );

            $r['porcentaje'] = bcmul(
                $porcentaje,
                '100',
                4
            );

            $r['parte'] = $parteDinero;

            $verificacion = bcadd(
                $verificacion,
                $parteDinero,
                10
            );
        }

        return [
            'monto' => $monto,
            'sumaIndices' => $sumaIndices,
            'partes' => $resultado,
            'verificacion' => $verificacion,
            'cuadra' => bccomp(
                $monto,
                $verificacion,
                2
            ) === 0,
        ];
    }

    /**
     * Reparto proporcional mixto
     *
     * Índice =
     * (producto factores directos)
     * /
     * (producto factores inversos)
     */
    public static function mixto(
        $monto,
        array $partes
    ): array {

        $monto = Money::normalize($monto);

        if (empty($partes)) {
            throw new InvalidArgumentException(
                'Debe proporcionar participantes'
            );
        }

        $resultado = [];

        $sumaIndices = '0';

        foreach ($partes as $parte) {

            $nombre = $parte['nombre'] ?? '';

            $directos = $parte['directos'] ?? [];

            $inversos = $parte['inversos'] ?? [];

            $productoDirecto = '1';

            foreach ($directos as $d) {

                $d = Money::normalize($d);

                $productoDirecto = bcmul(
                    $productoDirecto,
                    $d,
                    10
                );
            }

            $productoInverso = '1';

            foreach ($inversos as $inv) {

                $inv = Money::normalize($inv);

                if ($inv === '0') {
                    throw new InvalidArgumentException(
                        'Los factores inversos no pueden ser cero'
                    );
                }

                $productoInverso = bcmul(
                    $productoInverso,
                    $inv,
                    10
                );
            }

            $indice = bcdiv(
                $productoDirecto,
                $productoInverso,
                10
            );

            $resultado[] = [
                'nombre' => $nombre,
                'indice' => $indice,
                'directos' => $directos,
                'inversos' => $inversos,
            ];

            $sumaIndices = bcadd(
                $sumaIndices,
                $indice,
                10
            );
        }

        if ($sumaIndices === '0') {
            throw new InvalidArgumentException(
                'La suma de índices no puede ser cero'
            );
        }

        $verificacion = '0';

        foreach ($resultado as &$r) {

            $porcentaje = bcdiv(
                $r['indice'],
                $sumaIndices,
                10
            );

            $parteDinero = bcmul(
                $monto,
                $porcentaje,
                10
            );

            $r['porcentaje'] = bcmul(
                $porcentaje,
                '100',
                4
            );

            $r['parte'] = $parteDinero;

            $verificacion = bcadd(
                $verificacion,
                $parteDinero,
                10
            );
        }

        return [
            'monto' => $monto,
            'sumaIndices' => $sumaIndices,
            'partes' => $resultado,
            'verificacion' => $verificacion,
            'cuadra' => bccomp(
                $monto,
                $verificacion,
                2
            ) === 0,
        ];
    }
}
