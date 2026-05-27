<?php

declare(strict_types=1);

namespace App\Http;

use Psr\Http\Message\ResponseInterface;

final class Errors
{
    public static function ok(ResponseInterface $response, mixed $data, int $status = 200): ResponseInterface
    {
        $response->getBody()->write(json_encode(['ok' => true, 'data' => $data], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        return $response->withHeader('Content-Type', 'application/json; charset=utf-8')->withStatus($status);
    }

    public static function fail(ResponseInterface $response, string $code, string $message, ?string $field = null, int $status = 400): ResponseInterface
    {
        $body = ['ok' => false, 'error' => ['code' => $code, 'message' => $message]];
        if ($field !== null) {
            $body['error']['field'] = $field;
        }
        $response->getBody()->write(json_encode($body, JSON_UNESCAPED_UNICODE));
        return $response->withHeader('Content-Type', 'application/json; charset=utf-8')->withStatus($status);
    }
}
