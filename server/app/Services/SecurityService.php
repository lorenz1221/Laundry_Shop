<?php

namespace App\Services;

class SecurityService
{
    public static function containsSqlInjection(string $value): bool
    {
        $normalized = strtolower(trim($value));
        $blocked = [
            "' or '1'='1",
            "' or 1=1",
            '" or "1"="1',
            ' or 1=1--',
            ' union select',
            ' drop table',
            '; delete from',
        ];

        foreach ($blocked as $pattern) {
            if (str_contains($normalized, $pattern)) {
                return true;
            }
        }

        return (bool) preg_match('/(\bor\b|\band\b).*=.*=/i', $value);
    }

    public static function rejectInjection(array $fields): ?string
    {
        foreach ($fields as $label => $value) {
            if (! is_string($value)) {
                continue;
            }
            if (self::containsSqlInjection($value)) {
                return "Suspicious input detected in {$label}. Request blocked.";
            }
        }

        return null;
    }
}
