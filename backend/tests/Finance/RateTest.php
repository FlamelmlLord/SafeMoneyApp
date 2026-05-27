<?php

declare(strict_types=1);

namespace App\Tests\Finance;

use App\Finance\Rate;
use PHPUnit\Framework\TestCase;

final class RateTest extends TestCase
{
    public function testNominalToPeriodic(): void
    {
        // J=24% capitalizable mensualmente → i = 2%
        $r = Rate::nominalToPeriodic('0.24', 12);
        $this->assertSame(0, bccomp('0.02', $r['resultado'], 6));
    }

    public function testPeriodicToEffective(): void
    {
        // i=2% mensual → EA = 1.02^12 - 1 ≈ 0.26824
        $r = Rate::periodicToEffective('0.02', 12);
        $this->assertSame(0, bccomp('0.26824', $r['resultado'], 5));
    }

    public function testEffectiveToPeriodic(): void
    {
        // EA exacto = 1.02^12 - 1, m=12 → i = 2% exacto
        // Usamos el EA con suficiente precisión (10 dec) para que el round-trip cuadre.
        $r = Rate::effectiveToPeriodic('0.2682417946', 12);
        $this->assertSame(0, bccomp('0.02', $r['resultado'], 4));
    }

    public function testVencidaToAnticipada(): void
    {
        // i=10% → i_a = 10/110 ≈ 0.0909
        $r = Rate::vencidaToAnticipada('0.10');
        $this->assertSame(0, bccomp('0.09090909', $r['resultado'], 7));
    }

    public function testAnticipadaToVencida(): void
    {
        // i_a=0.0909... → i = 10%
        $r = Rate::anticipadaToVencida('0.09090909090909');
        $this->assertSame(0, bccomp('0.10', $r['resultado'], 6));
    }

    public function testConvertirUniversal(): void
    {
        // Nominal 24% capitalizable mensual → efectiva anual
        $r = Rate::convertir('nominal', 'efectiva', '0.24', 12, 1);
        $this->assertSame(0, bccomp('0.26824', $r['resultado'], 5));
    }
}
