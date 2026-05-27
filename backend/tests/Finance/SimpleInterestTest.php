<?php

declare(strict_types=1);

namespace App\Tests\Finance;

use App\Finance\SimpleInterest;
use PHPUnit\Framework\TestCase;

final class SimpleInterestTest extends TestCase
{
    public function testFCanonico(): void
    {
        // P=1000, i=10%, n=2 → F = 1200
        $r = SimpleInterest::calcularF('1000', '0.10', '2');
        $this->assertSame(0, bccomp('1200', $r['resultado'], 2));
    }

    public function testIDespeje(): void
    {
        // P=1000, F=1200, n=2 → i = 10%
        $r = SimpleInterest::calcularI('1000', '1200', '2');
        $this->assertSame(0, bccomp('0.10', $r['resultado'], 4));
    }

    public function testNDespeje(): void
    {
        // P=1000, F=1200, i=10% → n = 2
        $r = SimpleInterest::calcularN('1000', '1200', '0.10');
        $this->assertSame(0, bccomp('2', $r['resultado'], 2));
    }

    public function testInteres(): void
    {
        // P=1000, i=10%, n=2 → I = 200
        $r = SimpleInterest::interesTotal('1000', '0.10', '2');
        $this->assertSame(0, bccomp('200', $r['resultado'], 2));
    }
}
