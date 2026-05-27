<?php

declare(strict_types=1);

namespace App\Finance;

/**
 * Conversiones de tasas:
 *  - Nominal anual (J) ↔ periódica (i): i = J/m, J = i·m
 *  - Periódica (i) ↔ efectiva anual (EA): EA = (1+i)^m − 1, i = (1+EA)^(1/m) − 1
 *  - Vencida ↔ anticipada: i_a = i/(1+i), i = i_a/(1−i_a)
 *  - Equivalencia entre dos frecuencias periódicas distintas (vía EA)
 */
final class Rate
{
    public static function nominalToPeriodic(string|float $jAnual, int $m): array
    {
        $i = Money::div($jAnual, $m);
        return [
            'resultado' => Money::display($i),
            'pasos' => [
                ['expr' => 'i = J / m', 'detalle' => 'Tasa periódica = nominal anual / frecuencia de capitalización'],
                ['expr' => "i = $jAnual / $m = " . Money::display($i)],
            ],
        ];
    }

    public static function periodicToNominal(string|float $i, int $m): array
    {
        $j = Money::mul($i, $m);
        return [
            'resultado' => Money::display($j),
            'pasos' => [
                ['expr' => 'J = i × m'],
                ['expr' => "J = $i × $m = " . Money::display($j)],
            ],
        ];
    }

    public static function periodicToEffective(string|float $i, int $m): array
    {
        $ea = Money::sub(Money::pow(Money::add('1', $i), $m), '1');
        return [
            'resultado' => Money::display($ea),
            'pasos' => [
                ['expr' => 'EA = (1 + i)^m − 1'],
                ['expr' => "EA = (1 + $i)^$m − 1 = " . Money::display($ea)],
            ],
        ];
    }

    public static function effectiveToPeriodic(string|float $ea, int $m): array
    {
        $i = Money::sub(Money::nthRoot(Money::add('1', $ea), $m), '1');
        return [
            'resultado' => Money::display($i),
            'pasos' => [
                ['expr' => 'i = (1 + EA)^(1/m) − 1'],
                ['expr' => "i = (1 + $ea)^(1/$m) − 1 = " . Money::display($i)],
            ],
        ];
    }

    public static function vencidaToAnticipada(string|float $i): array
    {
        $ia = Money::div($i, Money::add('1', $i));
        return [
            'resultado' => Money::display($ia),
            'pasos' => [
                ['expr' => 'i_a = i / (1 + i)'],
                ['expr' => "i_a = $i / (1 + $i) = " . Money::display($ia)],
            ],
        ];
    }

    public static function anticipadaToVencida(string|float $ia): array
    {
        $i = Money::div($ia, Money::sub('1', $ia));
        return [
            'resultado' => Money::display($i),
            'pasos' => [
                ['expr' => 'i = i_a / (1 − i_a)'],
                ['expr' => "i = $ia / (1 − $ia) = " . Money::display($i)],
            ],
        ];
    }

    /**
     * Convertidor universal. Tipo origen y destino: 'nominal' | 'periodica' | 'efectiva' | 'anticipada-periodica' | 'anticipada-efectiva'.
     * Frecuencias en m periodos por año.
     */
    public static function convertir(string $tipoOrigen, string $tipoDestino, string|float $tasa, int $mOrigen, int $mDestino): array
    {
        // Paso 1: convertir todo a tasa efectiva anual vencida (EA) como pivote.
        $pasos = [];
        $ea = match ($tipoOrigen) {
            'efectiva' => Money::normalize($tasa),
            'periodica' => self::periodicToEffective($tasa, $mOrigen)['resultado'],
            'nominal' => self::periodicToEffective(self::nominalToPeriodic($tasa, $mOrigen)['resultado'], $mOrigen)['resultado'],
            'anticipada-periodica' => self::periodicToEffective(self::anticipadaToVencida($tasa)['resultado'], $mOrigen)['resultado'],
            'anticipada-efectiva' => self::anticipadaToVencida($tasa)['resultado'],
            default => throw new \InvalidArgumentException("Tipo origen desconocido: $tipoOrigen"),
        };
        $pasos[] = ['expr' => 'Pivote: convertir todo a EA vencida = ' . Money::display($ea)];

        // Paso 2: convertir EA al destino.
        $resultado = match ($tipoDestino) {
            'efectiva' => $ea,
            'periodica' => self::effectiveToPeriodic($ea, $mDestino)['resultado'],
            'nominal' => self::periodicToNominal(self::effectiveToPeriodic($ea, $mDestino)['resultado'], $mDestino)['resultado'],
            'anticipada-periodica' => self::vencidaToAnticipada(self::effectiveToPeriodic($ea, $mDestino)['resultado'])['resultado'],
            'anticipada-efectiva' => self::vencidaToAnticipada($ea)['resultado'],
            default => throw new \InvalidArgumentException("Tipo destino desconocido: $tipoDestino"),
        };
        $pasos[] = ['expr' => "Resultado en $tipoDestino (m=$mDestino) = " . Money::display($resultado)];

        return ['resultado' => Money::display($resultado), 'pasos' => $pasos];
    }
}
