<?php

declare(strict_types=1);

namespace App\Tests\Finance;

use App\Finance\Money;
use PHPUnit\Framework\TestCase;

final class MoneyTest extends TestCase
{
    public function testAddSubMulDiv(): void
    {
        $this->assertSame(0, bccomp('3.5', Money::add('1.2', '2.3', 2), 2));
        $this->assertSame(0, bccomp('0.9', Money::sub('1.0', '0.1', 2), 2));
        $this->assertSame(0, bccomp('6.25', Money::mul('2.5', '2.5', 2), 2));
        $this->assertSame(0, bccomp('4', Money::div('10', '2.5', 2), 2));
    }

    public function testPowIntegerExponent(): void
    {
        $this->assertSame(0, bccomp('32', Money::pow('2', '5', 0), 0));
    }

    public function testPowFractionalExponent(): void
    {
        // 8^(1/3) ≈ 2. La precisión de 1/3 (string '0.333...3' a 30 decimales) introduce un error
        // del orden de 1e-30; basta verificar |res − 2| < 1e-10 para uso financiero.
        $res = Money::pow('8', Money::div('1', '3'));
        $diff = Money::abs(Money::sub($res, '2'));
        $this->assertSame(-1, bccomp($diff, '0.0000000001', 12), "8^(1/3) debe ser ≈ 2, fue $res");
    }

    public function testLn(): void
    {
        // ln(e) = 1
        $e = '2.718281828459045235360287471352662497757';
        $this->assertSame(0, bccomp('1', Money::ln($e), 8));
        // ln(1) = 0
        $this->assertSame(0, bccomp('0', Money::ln('1'), 8));
    }

    public function testExp(): void
    {
        // exp(0) = 1
        $this->assertSame(0, bccomp('1', Money::exp('0'), 8));
        // exp(1) ≈ 2.71828
        $this->assertSame(0, bccomp('2.71828182845', Money::exp('1'), 8));
    }

    public function testNthRoot(): void
    {
        $this->assertSame(0, bccomp('3', Money::nthRoot('27', 3), 6));
        $this->assertSame(0, bccomp('2', Money::nthRoot('16', 4), 6));
    }

    public function testRoundHalfAwayFromZero(): void
    {
        $this->assertSame('1.24', Money::round('1.235', 2));
        $this->assertSame('-1.24', Money::round('-1.235', 2));
    }
}
