<?php

declare(strict_types=1);

namespace App\Tests\Finance;

use App\Finance\CompoundInterest;
use PHPUnit\Framework\TestCase;

final class CompoundInterestTest extends TestCase
{
    public function testFCanonico(): void
    {
        // P=1000, i=10%, n=5 → F = 1000 · 1.1^5 = 1610.51
        $r = CompoundInterest::calcularF('1000', '0.10', '5');
        $this->assertSame(0, bccomp('1610.51', $r['resultado'], 2));
    }

    public function testPDespeje(): void
    {
        // F=1610.51, i=10%, n=5 → P ≈ 1000
        $r = CompoundInterest::calcularP('1610.51', '0.10', '5');
        $this->assertSame(0, bccomp('1000', $r['resultado'], 0));
    }

    public function testNDespeje(): void
    {
        // P=1000, F=1610.51, i=10% → n ≈ 5
        $r = CompoundInterest::calcularN('1000', '1610.51', '0.10');
        $this->assertSame(0, bccomp('5', $r['resultado'], 2));
    }

    public function testIDespeje(): void
    {
        // P=1000, F=1610.51, n=5 → i ≈ 10%
        $r = CompoundInterest::calcularI('1000', '1610.51', '5');
        $this->assertSame(0, bccomp('0.10', $r['resultado'], 4));
    }

    public function testInteresTotal(): void
    {
        // I = F - P = 1610.51 - 1000 = 610.51
        $r = CompoundInterest::interesTotal('1000', '0.10', '5');
        $this->assertSame(0, bccomp('610.51', $r['resultado'], 2));
    }
}
