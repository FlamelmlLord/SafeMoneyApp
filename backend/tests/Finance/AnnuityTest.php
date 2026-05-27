<?php

declare(strict_types=1);

namespace App\Tests\Finance;

use App\Finance\Annuity;
use PHPUnit\Framework\TestCase;

final class AnnuityTest extends TestCase
{
    public function testPVencida(): void
    {
        // A=100, i=5%, n=10 → P ≈ 772.17
        $r = Annuity::valorPresenteVencida('100', '0.05', '10');
        $this->assertSame(0, bccomp('772.17', $r['resultado'], 2));
    }

    public function testFVencida(): void
    {
        // A=100, i=5%, n=10 → F ≈ 1257.79
        $r = Annuity::valorFuturoVencida('100', '0.05', '10');
        $this->assertSame(0, bccomp('1257.79', $r['resultado'], 2));
    }

    public function testPAnticipada(): void
    {
        // A=100, i=5%, n=10 → P_ant = 772.17 · 1.05 ≈ 810.78
        $r = Annuity::valorPresenteAnticipada('100', '0.05', '10');
        $this->assertSame(0, bccomp('810.78', $r['resultado'], 2));
    }

    public function testPerpetuidadVencida(): void
    {
        // A=100, i=5% → VP = 2000
        $r = Annuity::perpetuidadVencida('100', '0.05');
        $this->assertSame(0, bccomp('2000', $r['resultado'], 2));
    }

    public function testCuotaDadoP(): void
    {
        // P=10000, i=2%, n=5 → cuota ≈ 2121.58
        $r = Annuity::cuotaDadoP('10000', '0.02', '5');
        $this->assertSame(0, bccomp('2121.58', $r['resultado'], 2));
    }

    public function testCuotaDadoF(): void
    {
        // F=1000, i=5%, n=10 → A ≈ 79.50 (depósito periódico para meta)
        $r = Annuity::cuotaDadoF('1000', '0.05', '10');
        $this->assertSame(0, bccomp('79.50', $r['resultado'], 1));
    }

    public function testDiferida(): void
    {
        // A=100, i=5%, n=10, k=3 → P_dif = P_vencida(100,0.05,10) / 1.05^3
        //   = 772.1734929016... / 1.157625 ≈ 667.03
        $r = Annuity::valorPresenteDiferida('100', '0.05', '10', 3);
        $this->assertSame(0, bccomp('667.03', $r['resultado'], 2));
    }

    public function testCasoTasaCero(): void
    {
        // i=0% → P = A · n = 100 · 10 = 1000
        $r = Annuity::valorPresenteVencida('100', '0', '10');
        $this->assertSame(0, bccomp('1000', $r['resultado'], 2));
    }

    public function testCalcularN(): void
    {
        // A=100, F=1257.79, i=5% → n ≈ 10
        $r = Annuity::calcularN('100', '1257.79', '0.05');
        $this->assertSame(0, bccomp('10', $r['resultado'], 1));
    }
}
