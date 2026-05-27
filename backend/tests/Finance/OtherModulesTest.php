<?php

declare(strict_types=1);

namespace App\Tests\Finance;

use App\Finance\SimpleDiscount;
use App\Finance\ExtraPayment;
use App\Finance\ProportionalSplit;
use App\Finance\ValueEquation;
use PHPUnit\Framework\TestCase;

final class OtherModulesTest extends TestCase
{
    public function testDescuentoComercial(): void
    {
        // F=1000, d=10%, n=0.5 → D = 50, Vt = 950
        $r = SimpleDiscount::comercial('1000', '0.10', '0.5');
        $this->assertSame(0, bccomp('50', $r['resultado']['descuento'], 2));
        $this->assertSame(0, bccomp('950', $r['resultado']['valorTransaccion'], 2));
    }

    public function testDescuentoRacional(): void
    {
        // F=1000, i=10%, n=0.5 → D_r = 1000*0.10*0.5/(1+0.05) = 47.619
        $r = SimpleDiscount::racional('1000', '0.10', '0.5');
        $this->assertSame(0, bccomp('47.62', $r['resultado']['descuento'], 2));
    }

    public function testConversionDescuentoInteres(): void
    {
        // d=10%, n=0.5 → i = 0.10/(1-0.05) = 0.10526
        $r = SimpleDiscount::descuentoToInteres('0.10', '0.5');
        $this->assertSame(0, bccomp('0.10526', $r['resultado'], 5));
    }

    public function testRepartoSimple(): void
    {
        // 1000 entre [3, 2, 5] → [300, 200, 500]
        $r = ProportionalSplit::simple('1000', [
            ['nombre' => 'A', 'peso' => '3'],
            ['nombre' => 'B', 'peso' => '2'],
            ['nombre' => 'C', 'peso' => '5'],
        ]);
        $this->assertSame(0, bccomp('300', $r['partes'][0]['parte'], 2));
        $this->assertSame(0, bccomp('200', $r['partes'][1]['parte'], 2));
        $this->assertSame(0, bccomp('500', $r['partes'][2]['parte'], 2));
        $this->assertTrue($r['cuadra']);
    }

    public function testRepartoCompuesto(): void
    {
        // 600 entre [(capital 100, tiempo 2), (capital 200, tiempo 1), (capital 100, tiempo 1)]
        // pesos: 200, 200, 100 → sum 500 → partes: 240, 240, 120
        $r = ProportionalSplit::compuesto('600', [
            ['nombre' => 'A', 'capital' => '100', 'tiempo' => '2'],
            ['nombre' => 'B', 'capital' => '200', 'tiempo' => '1'],
            ['nombre' => 'C', 'capital' => '100', 'tiempo' => '1'],
        ]);
        $this->assertSame(0, bccomp('240', $r['partes'][0]['parte'], 2));
        $this->assertSame(0, bccomp('240', $r['partes'][1]['parte'], 2));
        $this->assertSame(0, bccomp('120', $r['partes'][2]['parte'], 2));
    }

    public function testEcuacionValor(): void
    {
        // Deuda de 1000 en periodo 0, se desea pagar con dos cuotas iguales X en periodos 6 y 12 a i=1% mensual.
        // 1000 = X·(1.01)^-6 + X·(1.01)^-12
        // Llevando a fecha focal 0: 1000 = X · (0.94204... + 0.88745...) = X · 1.82950
        // X = 1000 / 1.82950 ≈ 546.60
        $r = ValueEquation::resolver([
            ['monto' => '1000', 'periodo' => 0, 'lado' => 'izquierda', 'tieneX' => false],
            ['monto' => '0', 'periodo' => 6, 'lado' => 'derecha', 'tieneX' => true],
            ['monto' => '0', 'periodo' => 12, 'lado' => 'derecha', 'tieneX' => true],
        ], 0, '0.01');
        $this->assertSame(0, bccomp('546.60', $r['resultado'], 1));
    }

    public function testAbonoExtraReducirTiempo(): void
    {
        // P=10000, i=2%, n=10. Abono extra de 1000 en periodo 3.
        // Debe reducir el plazo.
        $r = ExtraPayment::reducirTiempo('10000', '0.02', 10, '1000', 3);
        $this->assertLessThan(10, $r['comparacion']['nNuevo']);
        $this->assertGreaterThan(0, $r['comparacion']['periodosAhorrados']);
    }

    public function testAbonoExtraReducirCuota(): void
    {
        // P=10000, i=2%, n=10. Abono extra de 1000 en periodo 3.
        // Cuota nueva < cuota original.
        $r = ExtraPayment::reducirCuota('10000', '0.02', 10, '1000', 3);
        $this->assertLessThan((float) $r['comparacion']['cuotaOriginal'], (float) $r['comparacion']['cuotaNueva']);
    }
}
