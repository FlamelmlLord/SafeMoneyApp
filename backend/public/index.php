<?php

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use App\Finance\Amortization;
use App\Finance\Annuity;
use App\Finance\CompoundInterest;
use App\Finance\ExtraPayment;
use App\Finance\ProportionalSplit;
use App\Finance\Rate;
use App\Finance\SimpleDiscount;
use App\Finance\SimpleInterest;
use App\Finance\ValueEquation;
use App\Http\Errors;
use App\Http\Validators;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Slim\Factory\AppFactory;

$app = AppFactory::create();
$app->addBodyParsingMiddleware();
$app->addRoutingMiddleware();

// CORS middleware
$app->add(function (ServerRequestInterface $request, $handler): ResponseInterface {
    $response = $request->getMethod() === 'OPTIONS'
        ? new \Slim\Psr7\Response()
        : $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Accept')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
});

// Error middleware (last)
$errorMiddleware = $app->addErrorMiddleware(true, true, true);
$errorMiddleware->setDefaultErrorHandler(function (ServerRequestInterface $req, \Throwable $e, bool $disp, bool $log, bool $logErr) {
    $response = new \Slim\Psr7\Response();
    $code = $e instanceof InvalidArgumentException ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR';
    $status = $e instanceof InvalidArgumentException ? 400 : 500;
    return Errors::fail($response, $code, $e->getMessage(), null, $status);
});

// Healthcheck
$app->get('/api/v1/health', fn($req, $res) => Errors::ok($res, ['status' => 'ok', 'phpVersion' => PHP_VERSION]));

// Catálogo de módulos
$app->get('/api/v1/modulos', function ($req, ResponseInterface $res) {
    return Errors::ok($res, [
        ['id' => 'reparto-proporcional', 'nombre' => 'Reparto Proporcional', 'categoria' => 'Fundamentos'],
        ['id' => 'interes-simple', 'nombre' => 'Interés Simple', 'categoria' => 'Fundamentos'],
        ['id' => 'descuento-simple', 'nombre' => 'Descuento Simple', 'categoria' => 'Fundamentos'],
        ['id' => 'interes-compuesto', 'nombre' => 'Interés Compuesto', 'categoria' => 'Compuesto y tasas'],
        ['id' => 'tasa-nominal-periodica', 'nombre' => 'Tasa Nominal ↔ Periódica', 'categoria' => 'Compuesto y tasas'],
        ['id' => 'tasa-efectiva', 'nombre' => 'Tasa Efectiva Anual', 'categoria' => 'Compuesto y tasas'],
        ['id' => 'equivalencia-tasas', 'nombre' => 'Equivalencia de Tasas', 'categoria' => 'Compuesto y tasas'],
        ['id' => 'tasa-anticipada-vencida', 'nombre' => 'Anticipada ↔ Vencida', 'categoria' => 'Compuesto y tasas'],
        ['id' => 'capitalizacion', 'nombre' => 'Capitalización (ahorro)', 'categoria' => 'Series uniformes'],
        ['id' => 'anualidades-vencidas', 'nombre' => 'Anualidades Vencidas', 'categoria' => 'Series uniformes'],
        ['id' => 'anualidades-anticipadas', 'nombre' => 'Anualidades Anticipadas', 'categoria' => 'Series uniformes'],
        ['id' => 'anualidades-diferidas', 'nombre' => 'Anualidades Diferidas', 'categoria' => 'Series uniformes'],
        ['id' => 'perpetuidades', 'nombre' => 'Perpetuidades', 'categoria' => 'Series uniformes'],
        ['id' => 'amortizacion', 'nombre' => 'Tablas de Amortización', 'categoria' => 'Amortización y avanzados'],
        ['id' => 'abonos-extra-tiempo', 'nombre' => 'Abonos Extra (reducir tiempo)', 'categoria' => 'Amortización y avanzados'],
        ['id' => 'abonos-extra-cuota', 'nombre' => 'Abonos Extra (reducir cuota)', 'categoria' => 'Amortización y avanzados'],
        ['id' => 'ecuaciones-valor', 'nombre' => 'Ecuaciones de Valor', 'categoria' => 'Amortización y avanzados'],
    ]);
});

// ─── Reparto proporcional ─────────────────────────────────────────────────
$app->post('/api/v1/reparto/simple', function ($req, $res) {
    $b = (array) $req->getParsedBody();
    $monto = Validators::num($b, 'monto');
    $partes = Validators::required($b, 'partes');
    return Errors::ok($res, ProportionalSplit::simple($monto, $partes));
});

$app->post('/api/v1/reparto/compuesto', function ($req, $res) {
    $b = (array) $req->getParsedBody();
    $monto = Validators::num($b, 'monto');
    $partes = Validators::required($b, 'partes');
    return Errors::ok($res, ProportionalSplit::compuesto($monto, $partes));
});

// ─── Interés simple ───────────────────────────────────────────────────────
$app->post('/api/v1/interes-simple/calcular', function ($req, $res) {
    $b = (array) $req->getParsedBody();
    $calcular = Validators::str($b, 'calcular', ['F', 'P', 'i', 'n']);
    $data = match ($calcular) {
        'F' => SimpleInterest::calcularF(Validators::num($b, 'P'), Validators::num($b, 'i'), Validators::num($b, 'n')),
        'P' => SimpleInterest::calcularP(Validators::num($b, 'F'), Validators::num($b, 'i'), Validators::num($b, 'n')),
        'i' => SimpleInterest::calcularI(Validators::num($b, 'P'), Validators::num($b, 'F'), Validators::num($b, 'n')),
        'n' => SimpleInterest::calcularN(Validators::num($b, 'P'), Validators::num($b, 'F'), Validators::num($b, 'i')),
    };
    return Errors::ok($res, $data);
});

// ─── Descuento simple ─────────────────────────────────────────────────────
$app->post('/api/v1/descuento-simple/calcular', function ($req, $res) {
    $b = (array) $req->getParsedBody();
    $tipo = Validators::str($b, 'tipo', ['comercial', 'racional']);
    $F = Validators::num($b, 'F');
    $tasa = Validators::num($b, $tipo === 'comercial' ? 'd' : 'i');
    $n = Validators::num($b, 'n');
    $data = $tipo === 'comercial' ? SimpleDiscount::comercial($F, $tasa, $n) : SimpleDiscount::racional($F, $tasa, $n);
    return Errors::ok($res, $data);
});

$app->post('/api/v1/descuento-simple/convertir-tasa', function ($req, $res) {
    $b = (array) $req->getParsedBody();
    $direccion = Validators::str($b, 'direccion', ['d-a-i', 'i-a-d']);
    $n = Validators::num($b, 'n');
    if ($direccion === 'd-a-i') {
        $data = SimpleDiscount::descuentoToInteres(Validators::num($b, 'd'), $n);
    } else {
        $data = SimpleDiscount::interesToDescuento(Validators::num($b, 'i'), $n);
    }
    return Errors::ok($res, $data);
});

// ─── Interés compuesto ────────────────────────────────────────────────────
$app->post('/api/v1/interes-compuesto/calcular', function ($req, $res) {
    $b = (array) $req->getParsedBody();
    $calcular = Validators::str($b, 'calcular', ['F', 'P', 'i', 'n', 'I']);
    $data = match ($calcular) {
        'F' => CompoundInterest::calcularF(Validators::num($b, 'P'), Validators::num($b, 'i'), Validators::num($b, 'n')),
        'P' => CompoundInterest::calcularP(Validators::num($b, 'F'), Validators::num($b, 'i'), Validators::num($b, 'n')),
        'i' => CompoundInterest::calcularI(Validators::num($b, 'P'), Validators::num($b, 'F'), Validators::num($b, 'n')),
        'n' => CompoundInterest::calcularN(Validators::num($b, 'P'), Validators::num($b, 'F'), Validators::num($b, 'i')),
        'I' => CompoundInterest::interesTotal(Validators::num($b, 'P'), Validators::num($b, 'i'), Validators::num($b, 'n')),
    };
    return Errors::ok($res, $data);
});

$app->post('/api/v1/interes-compuesto/comparativa', function ($req, $res) {
    $b = (array) $req->getParsedBody();
    $data = CompoundInterest::comparativaSimpleVsCompuesto(
        Validators::num($b, 'P'),
        Validators::num($b, 'i'),
        Validators::int($b, 'nMax')
    );
    return Errors::ok($res, $data);
});

// ─── Tasas ────────────────────────────────────────────────────────────────
$app->post('/api/v1/tasas/convertir', function ($req, $res) {
    $b = (array) $req->getParsedBody();
    $data = Rate::convertir(
        Validators::str($b, 'tipoOrigen'),
        Validators::str($b, 'tipoDestino'),
        Validators::num($b, 'tasa'),
        Validators::int($b, 'mOrigen'),
        Validators::int($b, 'mDestino')
    );
    return Errors::ok($res, $data);
});

$app->post('/api/v1/tasas/anticipada-vencida', function ($req, $res) {
    $b = (array) $req->getParsedBody();
    $direccion = Validators::str($b, 'direccion', ['v-a', 'a-v']);
    $tasa = Validators::num($b, 'tasa');
    $data = $direccion === 'v-a' ? Rate::vencidaToAnticipada($tasa) : Rate::anticipadaToVencida($tasa);
    return Errors::ok($res, $data);
});

// ─── Anualidades ──────────────────────────────────────────────────────────
$app->post('/api/v1/anualidades/calcular', function ($req, $res) {
    $b = (array) $req->getParsedBody();
    $tipo = Validators::str($b, 'tipo', ['vencida', 'anticipada', 'diferida', 'perpetuidad-vencida', 'perpetuidad-anticipada']);
    $calcular = Validators::str($b, 'calcular', ['P', 'F', 'A', 'n', 'i']);
    $A = Validators::num($b, 'A', false);
    $P = Validators::num($b, 'P', false);
    $F = Validators::num($b, 'F', false);
    $i = Validators::num($b, 'i', false);
    $n = Validators::num($b, 'n', false);
    $k = Validators::int($b, 'k', false);

    $data = match (true) {
        $tipo === 'vencida' && $calcular === 'P' => Annuity::valorPresenteVencida($A, $i, $n),
        $tipo === 'vencida' && $calcular === 'F' => Annuity::valorFuturoVencida($A, $i, $n),
        $tipo === 'vencida' && $calcular === 'A' && $P !== null => Annuity::cuotaDadoP($P, $i, $n),
        $tipo === 'vencida' && $calcular === 'A' && $F !== null => Annuity::cuotaDadoF($F, $i, $n),
        $tipo === 'vencida' && $calcular === 'n' => Annuity::calcularN($A, $F, $i),
        $tipo === 'vencida' && $calcular === 'i' => Annuity::calcularI($A, $F, $n),
        $tipo === 'anticipada' && $calcular === 'P' => Annuity::valorPresenteAnticipada($A, $i, $n),
        $tipo === 'anticipada' && $calcular === 'F' => Annuity::valorFuturoAnticipada($A, $i, $n),
        $tipo === 'diferida' => Annuity::valorPresenteDiferida($A, $i, $n, $k ?? 0),
        $tipo === 'perpetuidad-vencida' => Annuity::perpetuidadVencida($A, $i),
        $tipo === 'perpetuidad-anticipada' => Annuity::perpetuidadAnticipada($A, $i),
        default => throw new InvalidArgumentException("Combinación tipo='$tipo' y calcular='$calcular' no soportada"),
    };
    return Errors::ok($res, $data);
});

// ─── Amortización ─────────────────────────────────────────────────────────
$app->post('/api/v1/amortizacion/generar', function ($req, $res) {
    $b = (array) $req->getParsedBody();
    $data = Amortization::generar(
        Validators::str($b, 'sistema', ['frances', 'aleman', 'americano', 'colombiano']),
        Validators::num($b, 'P'),
        Validators::num($b, 'i'),
        Validators::int($b, 'n'),
        Validators::num($b, 'inflacion', false) ?? '0'
    );
    return Errors::ok($res, $data);
});

// ─── Abonos extra ─────────────────────────────────────────────────────────
$app->post('/api/v1/abonos-extra/reducir-tiempo', function ($req, $res) {
    $b = (array) $req->getParsedBody();
    $data = ExtraPayment::reducirTiempo(
        Validators::num($b, 'P'),
        Validators::num($b, 'i'),
        Validators::int($b, 'n'),
        Validators::num($b, 'abono'),
        Validators::int($b, 'periodoAbono')
    );
    return Errors::ok($res, $data);
});

$app->post('/api/v1/abonos-extra/reducir-cuota', function ($req, $res) {
    $b = (array) $req->getParsedBody();
    $data = ExtraPayment::reducirCuota(
        Validators::num($b, 'P'),
        Validators::num($b, 'i'),
        Validators::int($b, 'n'),
        Validators::num($b, 'abono'),
        Validators::int($b, 'periodoAbono')
    );
    return Errors::ok($res, $data);
});

// ─── Ecuaciones de valor ──────────────────────────────────────────────────
$app->post('/api/v1/ecuaciones-valor/resolver', function ($req, $res) {
    $b = (array) $req->getParsedBody();
    $data = ValueEquation::resolver(
        Validators::required($b, 'flujos'),
        Validators::int($b, 'fechaFocal'),
        Validators::num($b, 'i')
    );
    return Errors::ok($res, $data);
});

// 404 catch-all
$app->any('/{routes:.+}', function ($req, $res) {
    return Errors::fail($res, 'NOT_FOUND', 'Endpoint no encontrado: ' . $req->getUri()->getPath(), null, 404);
});

$app->run();
