<?php

declare(strict_types=1);

namespace App\Http;

use InvalidArgumentException;

final class Validators
{
    public static function required(array $body, string $key): mixed
    {
        if (!array_key_exists($key, $body)) {
            throw new InvalidArgumentException("Falta el campo requerido: $key");
        }
        return $body[$key];
    }

    public static function num(array $body, string $key, bool $required = true): ?string
    {
        if (!array_key_exists($key, $body)) {
            if ($required) {
                throw new InvalidArgumentException("Falta el campo requerido: $key");
            }
            return null;
        }
        $v = $body[$key];
        if ($v === '' || $v === null) {
            if ($required) {
                throw new InvalidArgumentException("Campo '$key' vacío");
            }
            return null;
        }
        if (is_string($v)) {
            $v = str_replace(',', '.', $v);
        }
        if (!is_numeric($v)) {
            throw new InvalidArgumentException("Campo '$key' debe ser numérico, recibido: " . var_export($v, true));
        }
        return (string) $v;
    }

    public static function int(array $body, string $key, bool $required = true): ?int
    {
        $v = self::num($body, $key, $required);
        if ($v === null) {
            return null;
        }
        if ((int) $v != (float) $v) {
            throw new InvalidArgumentException("Campo '$key' debe ser entero");
        }
        return (int) $v;
    }

    public static function str(array $body, string $key, array $allowed = [], bool $required = true): ?string
    {
        if (!array_key_exists($key, $body)) {
            if ($required) {
                throw new InvalidArgumentException("Falta el campo requerido: $key");
            }
            return null;
        }
        $v = (string) $body[$key];
        if ($allowed && !in_array($v, $allowed, true)) {
            throw new InvalidArgumentException("Campo '$key' debe ser uno de: " . implode(', ', $allowed));
        }
        return $v;
    }
}
