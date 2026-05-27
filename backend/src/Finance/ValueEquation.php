<?php

declare(strict_types=1);

namespace App\Finance;

/**
 * Ecuaciones de valor: resolver una incógnita X dentro de una línea de tiempo con
 * múltiples flujos llevados a una fecha focal a tasa efectiva periódica i.
 *
 * Cada flujo:
 *   { monto: string|number, periodo: number, lado: 'izquierda'|'derecha', tieneX?: boolean, coeficienteX?: number }
 *
 * - 'lado' indica de qué lado de la ecuación está (izquierda = deudas, derecha = pagos).
 * - 'tieneX' marca si el flujo contiene la incógnita; 'coeficienteX' multiplica a X (default 1).
 *
 * La fecha focal es un periodo entero. Cada flujo se lleva con (1+i)^(focal − periodo):
 *   - Si focal > periodo: se capitaliza.
 *   - Si focal < periodo: se descuenta.
 *
 * Ecuación: Σ flujos_izquierda(llevados a focal) = Σ flujos_derecha(llevados a focal)
 * Se despeja X linealmente: A·X + B = C·X + D  ⇒  X = (D − B) / (A − C)
 */
final class ValueEquation
{
    public static function resolver(array $flujos, int $fechaFocal, string|float $i): array
    {
        $coefX = '0';   // coeficiente neto de X (lado izquierda − derecha)
        $constante = '0'; // constante neta (lado izquierda − derecha)
        $pasos = [['expr' => "Llevando todos los flujos a la fecha focal n = $fechaFocal con tasa i = $i"]];

        foreach ($flujos as $f) {
            $monto = $f['monto'] ?? '0';
            $periodo = (int) ($f['periodo'] ?? 0);
            $lado = $f['lado'] ?? 'izquierda';
            $tieneX = (bool) ($f['tieneX'] ?? false);
            $coefFlujo = $f['coeficienteX'] ?? '1';

            $expo = $fechaFocal - $periodo;
            $factor = Money::pow(Money::add('1', $i), (string) $expo);
            $signo = $lado === 'izquierda' ? '1' : '-1';

            if ($tieneX) {
                $aporte = Money::mul(Money::mul($signo, $coefFlujo), $factor);
                $coefX = Money::add($coefX, $aporte);
                $pasos[] = ['expr' => "Flujo X (periodo $periodo, $lado, coef=$coefFlujo): X · " . Money::display($factor) . " → aporta " . Money::display($aporte) . " · X"];
            } else {
                $aporte = Money::mul(Money::mul($signo, $monto), $factor);
                $constante = Money::add($constante, $aporte);
                $pasos[] = ['expr' => "Flujo $monto (periodo $periodo, $lado): $monto · " . Money::display($factor) . " = " . Money::display(Money::mul($monto, $factor))];
            }
        }

        // Ecuación: coefX · X + constante = 0  ⇒  X = -constante / coefX
        if (Money::eq($coefX, 0)) {
            throw new \InvalidArgumentException('No hay incógnita X en los flujos o el coeficiente es cero.');
        }

        $X = Money::div(Money::neg($constante), $coefX);
        $pasos[] = ['expr' => "Ecuación: " . Money::display($coefX) . " · X + " . Money::display($constante) . " = 0"];
        $pasos[] = ['expr' => "X = " . Money::display(Money::neg($constante)) . " / " . Money::display($coefX) . " = " . Money::display($X)];

        return [
            'resultado' => Money::display($X, 2),
            'pasos' => $pasos,
            'coeficienteX' => Money::display($coefX),
            'constante' => Money::display($constante),
        ];
    }
}
