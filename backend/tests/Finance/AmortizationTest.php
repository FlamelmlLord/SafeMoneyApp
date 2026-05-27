<?php

declare(strict_types=1);

namespace App\Tests\Finance;

use App\Finance\Amortization;
use PHPUnit\Framework\TestCase;

final class AmortizationTest extends TestCase
{
    public function testFrancesCuota(): void
    {
        // P=10000, i=2%, n=5 → cuota ≈ 2121.58
        $r = Amortization::frances('10000', '0.02', 5);
        $this->assertSame(0, bccomp('2121.58', $r['cuota'], 2));
        $this->assertCount(5, $r['tabla']);
        // Saldo final cercano a cero
        $this->assertLessThan(0.05, abs((float) $r['tabla'][4]['saldo']));
    }

    public function testAlemanCapitalFijo(): void
    {
        // P=10000, n=5 → abono fijo = 2000 cada período
        $r = Amortization::aleman('10000', '0.02', 5);
        foreach ($r['tabla'] as $fila) {
            $this->assertSame(0, bccomp('2000', $fila['abono'], 2), "Abono al capital debe ser fijo 2000");
        }
    }

    public function testAmericanoIntereses(): void
    {
        // P=10000, i=2%, n=5 → cada período interés=200 salvo el último que paga capital
        $r = Amortization::americano('10000', '0.02', 5);
        $this->assertSame(0, bccomp('200', $r['tabla'][0]['interes'], 2));
        $this->assertSame(0, bccomp('200', $r['tabla'][0]['cuota'], 2));
        // Último: cuota = 200 + 10000 = 10200
        $this->assertSame(0, bccomp('10200', $r['tabla'][4]['cuota'], 2));
    }

    public function testColombianoSinInflacion(): void
    {
        // Sin inflación, sistema colombiano = francés
        $rCol = Amortization::colombiano('10000', '0.02', 5, '0');
        $rFr = Amortization::frances('10000', '0.02', 5);
        $this->assertSame($rFr['cuota'], $rCol['cuota']);
    }
}
